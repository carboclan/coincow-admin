<template>
  <el-dialog title="Sell Cow" :show-close="false" :visible="showSellerDialog">
    <el-form :model="form" v-if="cowData">
      <div><span class="form-label">Current Difficulty:</span> {{diff}}</div>
      <div><span class="form-label">Contract Size:</span> {{cowData.contractSize}}({{cowData.contractUnit}})</div>
      <el-form-item label="Difficulty Increase">
        <el-input v-model="form.diffacc" auto-complete="off"><template slot="append">%</template></el-input>
      </el-form-item>
      <div><span class="form-label">Estmate Life Production:</span> {{ estPrice }}</div>
      <el-form-item label="Your Price" >
        <el-input v-model="form.price" auto-complete="off"><template slot="append">Ether</template></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">Cancel</el-button>
      <el-button type="primary" @click="sellCow">Sell</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { web3, contracts } from '@/lib/eth'
export default {
  name: 'calculator',
  props: {
    cowData: Object,
    showSellerDialog: Boolean
  },
  data() {
    return {
      form: {
        price: 1,
        diffacc: 6
      }
    }
  },
  computed: {
    diff: function () {
      if (!this.cowData) {
        return 1
      }
      if (this.cowData.cowType === 'bitcoin') {
        return 6389316883511
      }
      if (this.cowData.cowType === 'ether') {
        return 283675708561669
      }
    },
    estPrice: function () {
      if (!this.cowData) {
        return 1
      }
      if (this.cowData.cowType === 'bitcoin') {
        return this.calBtc()
      }
      if (this.cowData.cowType === 'ether') {
        return this.calEth()
      }
    }
  },
  filters: {
  },
  methods: {
    calEth () {
      const duration = ( this.cowData.endTime - this.cowData.startTime )
      const production = duration * 1000000 / 14592636 * 3 * this.cowData.contractSize * 1000000 / this.diff
      this.form.price = production
      return (production + ' ETH')
    },
    calBtc () {
      const duration = ( this.cowData.endTime - this.cowData.startTime )
      const segment = duration / 13 / 24 / 3600
      const initProd = 12.5 * 13 * 24 * 3600 / ( this.diff * 2 ** 32 / (this.cowData.contractSize * 1000000000))
      let production = initProd * (segment % 1)
      for (let i = 1; i < segment; i++) {
        production += initProd / (( 1 + this.diffacc ) ** i)
      }
      this.form.price = production * 21
      return (production + ' BTC')
    },
    onEstmate (value) {
      console.log(value)
    },
    onClose () {
      this.$emit('close')
    },
    async sellCow () {
      if (!(this.form.price > 0)) {
        alert('price too low')
        return
      }
      const tx = await contracts.coinCowCore.createAuction(this.cowData.cowId, web3.toWei(this.form.price, 'ether'))
      await web3.eth.getTransactionReceipt(tx)
      console.log('sell')
      this.$emit('sold')
    }
  }
}
</script>
<style scoped>
.form-label {
  font-weight: 600;
}
</style>
