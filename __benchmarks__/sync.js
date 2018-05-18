function basic(num){
  var a = 1, b = 0, temp;

  while (num >= 0){
    temp = a;
    a = a + b;
    b = temp;
    num--;
  }

  return b;
}

function recursive(num) {
  if (num <= 1) return 1;

  return recursive(num - 1) + recursive(num - 2);
}

suite('fibonaci', () => {
    scenario('basic', () => {
        basic(30);
    })

    scenario('recursive', () => {
        recursive(30);
    })
})
