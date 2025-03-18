function createCounter() {
  let count = 0;

  return {
    increment: function () {
      count++;
      console.log(count);
    },
    decrement: function () {
      count--;
      console.log(count);
    },
    getCount: function () {
      return count;
    },
  };
}

const counter = createCounter();
counter.increment(); // Logs 1
counter.increment(); // Logs 2
counter.decrement(); // Logs 1
console.log(counter.getCount()); // Outputs 1
console.log(createCounter()); // Returns object
console.log("------------------------"); // Divider


// Recursive Fibonacci Sequence calculator with cache memory
// First call to fib(5):
// 1. Check cache: not found
// 2. Calculate fib(4) + fib(3)
//    - fib(4) needs fib(3) + fib(2)
//    - fib(3) needs fib(2) + fib(1)
//    - ...and so on
// 3. Store all results in cache

// Cache after first fib(5):
// {0:0, 1:1, 2:1, 3:2, 4:3, 5:5}

// Second call to fib(5):
// - Directly returns 5 from cache
// Start with base 0:0, 1:0 - remaining can be calculated

