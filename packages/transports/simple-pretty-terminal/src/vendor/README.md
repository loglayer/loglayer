This is a copy of [prettyjson](https://github.com/rafeca/prettyjson) by [@rafeca](https://github.com/rafeca) 
using the [PR code](https://github.com/rafeca/prettyjson/pull/59) by [@fbartho](https://github.com/fbartho) 
to use `chalk` for colorization. 

The PR was a good starting point, but still contained bugs. This fork fixes bugs around using chalk, and makes it so
that only chalk can be used. It also changes the boolean to a single color.