/// hypergeometric(Number of successes in sample, Population size, Sample size, Number of successes in population)
var _x, _N, _n, _k;

_x = argument0;// sucesses in sample
_N = argument1;// population size
_n = argument2;// sample size
_k = argument3;// sucesses in population

var _a = comb(_k, _x)
var _b = comb(_N-_k, _n-_x);
var _c = comb(_N, _n);

return _a * _b / _c;
