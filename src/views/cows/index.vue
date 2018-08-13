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
      <el-table-column label="End Time" width="200" align="center">
        <template slot-scope="scope">
          <span>{{scope.row.endTime}}</span>
        </template>
      </el-table-column>
      <el-table-column label="Milk Level" width="150" align="center">
        <template slot-scope="scope">
          {{scope.row.milkLevel}}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Status" width="110" align="center">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.onAuction">On Auction</el-tag>
          <el-tag v-if="!scope.row.onAuction">Milking</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Action" width="200">
        <template slot-scope="scope">
          <el-button round :disabled="scope.row.owner !== token || scope.row.onAuction" type="primary" v-on:click="sellCow(scope.row.cowId)">Sell</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils/index'
import { contracts, coinMap, web3 } from '@/lib/eth'
export default {
  data() {
    return {
      list: null,
      listLoading: false
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
    async sellCow(cowId) {
      const res = await this.$prompt('Please input price in Ether', 'Tip', {
        confirmButtonText: 'Sell',
        cancelButtonText: 'Cancel',
        inputType: 'number',
        inputValidator: (_value) => {
          if(_value > 0) {
            return true
          } else {
            return 'Price should be more than 0'
          }
        }
      })
      if (res.action === 'confirm') {
        await contracts.coinCowCore.createAuction(cowId, web3.toWei(res.value, 'ether'))
        this.fetchData()
      }
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
  			const cowArray = await cowCoin.contract.getCowInfo(i)
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
  				contractSize: cowArray[0].toNumber(),
  				lastStolen: cowArray[1].toNumber(),
  				lastMilkTime: parseTime(cowArray[2].toNumber()),
  				startTime: parseTime(cowArray[3].toNumber()),
  				endTime: parseTime(cowArray[4].toNumber()),
  				totalMilked: cowArray[5].toNumber(),
  				totalStolen: cowArray[6].toNumber()
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
