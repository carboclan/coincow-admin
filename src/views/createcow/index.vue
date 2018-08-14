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

const unit = {};
(async () => {
  unit.eth = await contracts.EtherCow.contractUnit()
  unit.btc = await contracts.BitcoinCow.contractUnit()
})()

export default {
  data() {
    return {
      options: [
        { value: 'EtherCow', label: 'Ethereum' },
        { value: 'BitcoinCow', label: 'Bitcoin' }
      ],
      unit,
      form: {
        type: 'EtherCow'
      }
    }
  },
  methods: {
    async onSubmit() {
      const res = await this.$prompt('Please input hash rate in ' + this.unit[this.form.type], 'Tip', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        inputType: 'number',
        inputValidator: (_value) => {
          if(_value > 0) {
            return true
          } else {
            return 'hash rate should be more than 0'
          }
        }
      })
      if (res.action === 'confirm') {
        await contracts[this.form.type].createCow(res.value, 7 * 24 * 3600)
      }
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
