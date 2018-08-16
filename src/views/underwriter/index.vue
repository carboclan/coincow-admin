<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="Address">
        <el-input v-model="form.address" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Add</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { web3, contracts } from '@/lib/eth'
export default {
  data() {
    return {
      form: {
        address: ''
      }
    }
  },
  methods: {
    async onSubmit() {
      if (this.form.address.length === 42) {
        const tx = contracts.coinCowCore.setUnderwriter(this.form.address, true)
        await web3.eth.getTransactionReceipt(tx)
        alert('set ' + this.form.address + ' as underwriter')
        return
      }
      alert('wrong address')
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
