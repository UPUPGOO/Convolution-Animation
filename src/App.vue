<template>
  <div id="app">
    <graph label="x(t)" @inputFunc="setInputFunc1"></graph>
    <graph label="h(t)" @inputFunc="setInputFunc2"></graph>
    <convolution :func1='inputFunc1' :func2='inputFunc2'></convolution>
    <h3>支持加、减、乘、除、乘方运算</h3>
    <h3>支持sin、cos、tan、asin、acos、atan、abs(绝对值)运算</h3>
  </div>
</template>
<script>
import graph from './components/graph'
import convolution from './components/convolution'
export default {
  name: 'app',
  data() {
    return {
      inputFunc1:{},
      inputFunc2:{}
    }
  },
  methods: {
    setInputFunc1(payload) {
      this.inputFunc1=payload;
      // console.log('func1', payload);
    },
    setInputFunc2(payload) {
      this.inputFunc2=payload;
      // console.log('func2', (payload));
    },

  },
  components: {
    graph,
    convolution
  }
}

</script>
<style>
#app {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}

</style>
