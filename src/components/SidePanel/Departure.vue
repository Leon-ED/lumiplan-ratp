<template>
<aside class="departure-in">
<div class="text">
Départ dans
</div>
<div class="time">
 2
</div>
<div class="unit">
 min
</div>
</aside>


</template>
<script setup lang="ts">
</script>
<style lang="css" scoped>
.departure-in{
    display: flex;
    padding: 1cqw;
    flex-direction: column;
    background-color: black;
    justify-content: space-between;
    color:var(--ratp-yellow);}
.text{
    color:white;
}
.time,.unit{
    text-align: center;
    font-family: 'ParisineBold';
}
.time{
    font-size: 15cqw;
    
}
.unit{
    font-size: 4cqw;
    opacity: .8;


}
</style>