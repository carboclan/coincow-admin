<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="Cow Type">
        <el-select v-model="form.type" placeholder="Please Select">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Create</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { contracts } from '@/lib/eth'
export default {
  data() {
    return {
      options: [
        { value: 'eth', label: 'Ethereum' },
        { value: 'btc', label: 'Bitcoin' }
      ],
      form: {
        type: 'eth'
      }
    }
  },
  methods: {
    onSubmit() {
      if (this.form.type === 'btc') {
        this.createBtcCow()
      }
      if (this.form.type === 'eth') {
        this.createEthCow()
      }
    },
    async createEthCow () {
      const cowId = await contracts.EtherCow.createCow()
      console.log(cowId)
    },
    async createBtcCow () {
      const cowId = await contracts.BitcoinCow.createCow()
      console.log(cowId)
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
