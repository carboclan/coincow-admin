<template>
  <div class="app-container">
    <el-table :data="list" v-loading="listLoading" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label='ID' width="95">
        <template slot-scope="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column label="Type" width="110" align="center">
        <template slot-scope="scope">
          {{scope.row.cowType}}
        </template>
      </el-table-column>
      <el-table-column label="Owner" width="360" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.owner}}</span>
        </template>
      </el-table-column>
      <el-table-column label="Hash Rate" width="200" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.contractSize}}{{scope.row.contractUnit}}</span>
        </template>
      </el-table-column>
      <el-table-column label="End Time" width="200" align="center">
        <template slot-scope="scope">
          <span>{{parseTime(scope.row.endTime * 1000)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="Milk Level" width="100" align="center">
        <template slot-scope="scope">
          {{scope.row.milkLevel.toFixed(6)}}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Status" width="110" align="center">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.onAuction">On Auction</el-tag>
          <el-tag v-if="!scope.row.onAuction">Milking</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Action" width="150">
        <template slot-scope="scope">
          <el-button round :disabled="scope.row.owner !== token || scope.row.onAuction" type="primary" v-on:click="sellCow(scope.row)">Sell</el-button>
        </template>
      </el-table-column>
    </el-table>
    <calculator :showSellerDialog="showSellerDialog" :cowData="cowData" v-on:close="onCloseCal" v-on:sold="onSold"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils/index'
import { coinMap } from '@/lib/eth'
import calculator from './calculator'
import { getCowList } from '@/lib/api'
import { sleep } from '@/lib/util'
export default {
  components: { calculator },
  data() {
    return {
      list: null,
      listLoading: false,
      showSellerDialog: false,
      cowData: null
    }
  },
  computed: {
    ...mapGetters([
      'token'
    ])
  },
  filters: {
  },
  mounted() {
    console.log('fetch data')
    this.fetchData()
  },
  methods: {
    parseTime,
    async sellCow(cow) {
      this.cowData = cow
      this.showSellerDialog = true
    },
    async onSold() {
      this.showSellerDialog = false
      await sleep(1000)
      this.fetchData()
    },
    onCloseCal() {
      this.showSellerDialog = false
    },
    async fetchData() {
      if (this.listLoading) {
        return
      }
      this.listLoading = true
      this.list = []
      console.log('start getCow')
  		const resp = await getCowList()
      const cowListPromise = resp.result.map(async cow => {
        const cowCoin = coinMap[cow.contract]
        cow.cowType = coinMap[cow.contract].type
        cow.contractUnit = coinMap[cow.contract].contractUnit
        cow.contractAddress = cow.contract
        cow.contract = cowCoin.contract
        const [contractSize, lastStolen, lastMilkTime, startTime, endTime, totalMilked, totalStolen] = await cowCoin.contract.getCowInfo(cow.id)
        cow.contractSize = contractSize.toNumber()
        cow.lastStolen = lastStolen.toNumber()
        cow.lastMilkTime = lastMilkTime.toNumber()
        cow.startTime = startTime.toNumber()
        cow.endTime = endTime.toNumber()
        cow.totalMilked = totalMilked.toNumber()
        cow.totalStolen = totalStolen.toNumber()
        cow.onAuction = cow.price > 0
        cow.milk = await cowCoin.contract.milkAvailable(cow.id)
        cow.stealThreshold = cowCoin.stealThreshold = cowCoin.stealThreshold || await cowCoin.contract.stealThreshold()
        cow.milkThreshold = cowCoin.milkThreshold = cowCoin.milkThreshold || await cowCoin.contract.milkThreshold()
        cow.milkLevel = cow.milk / cow.stealThreshold > 1 ? 1 : cow.milk / cow.stealThreshold
        return cow
      })
      const cowList = await Promise.all(cowListPromise)
      console.log('end getCow')
      this.list = cowList
      this.listLoading = false
    }
  }
}
</script>
