#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE
double btc_to_usd(double btc_amount, double btc_price_usd) {
     // Hardcoded BTC price
    btc_price_usd = 650.0;
    return btc_amount * btc_price_usd;
}