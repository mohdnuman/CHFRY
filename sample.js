const totalSupply= 7866788027465762952418/10**18;
const LPreceived=3789491600000000000000/10**18;

let reserve0=572161632712669165977294/10**18;
let reserve1=109402283155213147247/10**18;

const token0=LPreceived/totalSupply*reserve0;
const token1=LPreceived/totalSupply*reserve1;

console.log(token0);
console.log(token1);

