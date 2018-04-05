<template>
  <div id="convolution">
    <line-chart :chart-data="datacollection" :width="200" :height="200"></line-chart>
    <line-chart :chart-data="dataconvolution" :options="optionsconvolution" :width="200" :height="200"></line-chart>
    <!-- <el-button size='mini' @click="move">开始</el-button> -->
    <el-slider v-model="step" :min="0" :max="steps" :show-input="true" input-size="mini" @change="move"></el-slider>
  </div>
</template>
<script>
import lineChart from "../chartjs/lineChart.js"
const StringToMath = require('../assets/js/StringToMath.js')
const integral = require('../assets/js/integral.js')

export default {
  name: 'convolution',
  props: ['func1', 'func2'],
  data() {
    return {
      datacollection: null,
      dataconvolution: null,
      optionsconvolution: {
        animation: {
          duration: 0
        },
        responsive: false
      },
      steps: 100,
      step: 0
    }
  },
  computed: {
    range() {
      let res = [];
      let x1 = this.func1.x1 - (this.func2.x2 - this.func2.x1) //- 1;
      let x2 = this.func1.x2 + (this.func2.x2 - this.func2.x1) //+ 1;
      let stepLength = (x2 - x1) / this.steps;
      for (let i = 0; i <= this.steps; i++) {
        res.push(parseFloat((x1 + stepLength * i).toFixed(2)));
      }
      return res;
    },
    dataFunc1() {
      let f = new StringToMath(this.func1.func).result;
      let res = [];
      for (let x of this.range) {
        if (x < this.func1.x1 || x > this.func1.x2)
          res.push(0);
        else {
          res.push(f(x));
        }
      }
      return res;
    },
    dataFunc2() {
      let t1 = this.func1.x1 + this.func2.x1;
      let f = new StringToMath(this.func2.func).result;
      let res = [];
      for (let x of this.range) {
        if (x < t1 - this.func2.x2 || x > t1 - this.func2.x1)
          res.push(0);
        else {
          res.push(f(-x));
        }
      }
      return res;
    },
    c_range() {
      let res = [];
      let t1 = this.func1.x1 + this.func2.x1;
      let t2 = this.func1.x2 + this.func2.x2;
      let stepLength = (t2 - t1) / this.steps;
      for (let i = 0; i <= this.step; i++) {
        res.push(parseFloat((t1 + stepLength * i).toFixed(2)));
      }
      return res;
    },
    c_data() {
      let xStr = this.func1.func;
      let hStr = this.func2.func;
      let x1 = this.func1.x1;
      let x2 = this.func1.x2;
      let h1 = -this.func2.x2;
      let h2 = -this.func2.x1;
      let res = [];
      let range = [];
      for (let t of this.c_range) {
        range = this.getMidNum([x1, x2, h1 + t, h2 + t]);
        let fStr = "(" + xStr + ")*(" + hStr.replace(/x/g, "(" + t + "-x)") + ")";
        let num = parseFloat(integral(fStr, range[0], range[1]).toFixed(2));
        res.push(num)
      }
      return res;
    }
  },
  mounted() {
    // this.fillData();
    // this.move();
  },
  methods: {
    fillData(x) {
      let x_ = this.func1.x2 - this.func1.x1;
      let h_ = this.func2.x2 - this.func2.x1;
      x /= ((2*h_+x_)/(h_+x_));
      let data = this.dataFunc2.slice(0); //实现数组的深拷贝
      if (x) {
        let arr = data.slice(-x);
        data.splice(-x, x);
        data.splice(0, 0, ...arr);
      }
      this.datacollection = {
        labels: this.range,
        datasets: [{
          label: 'x(t)',
          borderWidth: 2,
          borderColor: '#f87979',
          fill: false,
          pointRadius: 0,
          data: this.dataFunc1
        }, {
          label: 'h(t)',
          borderWidth: 2,
          borderColor: '#6699ff',
          fill: false,
          pointRadius: 0,
          data: data
        }]
      };
    },
    move() {
      this.fillData(this.step);
      this.dataconvolution = {
        labels: this.c_range,
        datasets: [{
          label: '卷积结果',
          borderWidth: 2,
          borderColor: '#ccff33',
          fill: false,
          pointRadius: 0,
          data: this.c_data
        }]
      };
    },
    getMidNum(nums) {
      nums.sort(function(first, second) {
        let f = parseFloat(first, 10),
          s = parseFloat(second, 10);
        if (f < s) {
          return -1;
        } else if (f > s) {
          return 1;
        } else {
          return 0;
        }
      });
      return [nums[1], nums[2]];
    }
  },
  components: {
    lineChart
  }
}

</script>
