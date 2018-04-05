<template>
  <div id="graph">
    <line-chart :chart-data="datacollection" :options="optionscollection" :width="400" :height="400"></line-chart>
    输入函数：
    <input type="text" name="function" v-model='func'> &nbsp; &nbsp;
    <el-select v-model="value" placeholder="请选择" style="width:150px;" @change="select">
      <el-option v-for="item in selects" :key="item.value" :label="item.label" :value="item.value">
      </el-option>
    </el-select>
    <br/> x1:
    <input style="width:60px;" type="number" name="x1" v-model.number='x1' @click="fillData"> x2:
    <input style="width:60px;" type="number" name="x2" v-model.number='x2' @click="fillData">&nbsp;
    <el-button size='mini' @click="fillData">画图</el-button>
    <el-slider v-model="steps" :min="10" :max="500" :show-input="true" input-size="mini" @change="fillData"></el-slider>
  </div>
</template>
<script>
import lineChart from "../chartjs/lineChart.js"
const StringToMath = require('../assets/js/StringToMath.js')

export default {
  name: 'graph',
  props: ['label'],
  data() {
    return {
      x1: 0,
      x2: 1,
      steps: 80,
      func: "1",
      datacollection: null,
      optionscollection: { responsive: false },
      selects: [{
        value: '1',
        label: '单位冲激信号'
      }, {
        value: '2',
        label: '单位阶跃信号'
      }, {
        value: '3',
        label: '正弦信号'
      }, {
        value: '4',
        label: '余弦信号'
      }, {
        value: '5',
        label: '指数信号'
      }, {
        value: '6',
        label: '抽样信号'
      }],
      value: '2'
    }
  },
  computed: {
    range() {
      let res = [];
      let stepLength = (this.x2 - this.x1) / this.steps;
      for (let i = 0; i <= this.steps; i++) {
        res.push(parseFloat((this.x1 + stepLength * i).toFixed(2)));
      }
      return res;
    },
    dataSet() {
      let f = new StringToMath(this.func).result;
      let res = [];
      for (let x of this.range) {
        res.push(f(x));
      }
      return res;
    }
  },

  mounted() {
    this.fillData();
  },
  methods: {
    fillData() {
      this.datacollection = {
        labels: this.range,
        datasets: [{
          label: this.label,
          borderWidth: 2,
          borderColor: '#f87979',
          fill: false,
          pointRadius: 0,
          data: this.dataSet
        }]
      };
      this.$emit('inputFunc', { func: this.func, x1: this.x1, x2: this.x2 });
    },
    select(value) {
      switch (value) {
        case '1':
          this.func = '1000000';
          this.x1 = 0;
          this.x2 = 0.000001;
          break;
        case '2':
          this.func = '1';
          this.x1 = 0;
          this.x2 = 1;
          break;
        case '3':
          this.func = 'sinx';
          this.x1 = -5;
          this.x2 = 5;
          break;
        case '4':
          this.func = 'cosx';
          this.x1 = -5;
          this.x2 = 5;
          break;
        case '5':
          this.func = '2.71828^(x)';
          this.x1 = 0;
          this.x2 = 10;
          break;
        case '6':
          this.func = 'sinx/x';
          this.x1 = -10;
          this.x2 = 10;
          break;
      }
      this.fillData();
    }
  },
  components: {
    lineChart
  }
}

</script>
<style>


</style>
