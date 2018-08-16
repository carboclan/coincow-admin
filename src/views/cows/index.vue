<template>
  <div class="app-container">
    <el-table :data="list" v-loading="listLoading" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label='ID' width="95">
        <template slot-scope="scope">
          {{scope.row.cowId}}
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
    <calculator :showSellerDialog="showSellerDialog" :cowData="cowData" v-on:close="onCloseCal"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils/index'
import { contracts, coinMap, web3 } from '@/lib/eth'
import calculator from './calculator'
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
  created() {
    console.log('fetch data')
    this.fetchData()
  },
  methods: {
    parseTime,
    async sellCow(cow) {
      this.cowData = cow
      this.showSellerDialog = true
    },
    onSold() {
      this.showSellerDialog = false
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
  		const total = (await contracts.coinCowCore.totalSupply()).toNumber()
      const cowIndex = []
      for (let i = 1; i < total + 1; i++) {
        cowIndex.push(i)
      }
      const cowPromises = cowIndex.map(async i => {
        console.log('get cow ' + i)
  			const cowId = await contracts.coinCowCore.getCow(i)
  			const cowCoin = coinMap[cowId[0]]
        const contractUnit = await cowCoin.contract.contractUnit()
  			const [contractSize, lastStolen, lastMilkTime, startTime, endTime, totalMilked, totalStolen] = await cowCoin.contract.getCowInfo(i)
  			const owner = await contracts.coinCowCore.ownerOf(i)
  			const milk = await cowCoin.contract.milkAvailable(i)
  			const stealThreshold = await cowCoin.contract.stealThreshold()
  			const cow = {
  				cowId: i,
  				owner,
  				milk,
  				stealThreshold,
  				contract: cowCoin.contract,
  				milkLevel: milk / stealThreshold > 1 ? 1 : milk / stealThreshold,
  				cowType: coinMap[cowId[0]].type,
          contractSize: contractSize.toNumber(),
          contractUnit,
          lastStolen: lastStolen.toNumber(),
  				lastMilkTime: lastMilkTime.toNumber(),
  				startTime: startTime.toNumber(),
  				endTime: endTime.toNumber(),
  				totalMilked: totalMilked.toNumber(),
  				totalStolen: totalStolen.toNumber()
  			}
        console.log('get auction ' + i)
  			const onAuction = await contracts.auctionHouse.isOnAuction(i)
  			if (onAuction) {
  				cow.onAuction = true
  				const auctionArray = await contracts.auctionHouse.getAuction(i)
  				cow.price = web3.fromWei(auctionArray[1].toNumber())
  				cow.seller = auctionArray[0]
  			} else {
  				cow.onAuction = false
  			}
        this.list.push(cow)
        console.log(cow)
  			return cow
  		})
      await Promise.all(cowPromises)
      this.listLoading = false
    }
  }
}
</script>
