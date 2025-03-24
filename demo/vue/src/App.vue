<script setup>
const jsErr = () => {
  let num = new Number(33.22)
  console.log(num.toFixed(-1))
}
</script>

<template>
  <button @click="jsErr">js错误模拟</button>
</template>
