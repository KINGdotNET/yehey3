import React from 'react';

import { injectIntl, FormattedMessage } from 'react-intl';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import Affix from '../components/Utils/Affix';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import './Coins.less';
var CryptoJS = require("crypto-js");
import wehelpjs from 'wehelpjs';
//const CanvasJS = require('canvasjs');

class Coins extends React.Component {
    state = {
        coins: [],
    };

    getCoinsData() {
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h%2C7d')
        .then(results => results.json())
        .then(coins => {
            this.setState({
                coins: coins
            });
            //console.log("GotCoinsData:", coins[0]);
        });
    }

    displayCoins() {
        const { coins } = this.state;
        return(
            <div className="Coins">
                        <h1 className="Coins__title">
                            Coins
                        </h1>
                        <a href="https://www.coingecko.com/en/api">Powered by Coingecko API 🐸 </a>
                        <div className="Coins__block"> 
                            <span>  </span>
                            <span> Coin </span>
                            <span> Price </span>
                            <span> 24H % </span> 
                            <span> 7D % </span>
                        </div>
                        {coins[0] && coins.map(coin => 
                        <div key={coin.id} className="Coins__block"> 
                            <Link to={`/trending-${coin.symbol}/hot-${coin.symbol}`}> <img src={coin.image} className="Coins__coinpic"/> </Link>
                            <div className="Coin__symbol"> <Link to={`/trending-${coin.symbol}/hot-${coin.symbol}`}> {coin.symbol.toUpperCase()}</Link> </div>
                            <div>${new Number(coin.current_price).toPrecision(6)}</div>
                            <div>{coin.price_change_percentage_24h_in_currency > 0 ? "+":""}{new Number(coin.price_change_percentage_24h_in_currency).toPrecision(3)}%</div>
                            <div>{coin.price_change_percentage_7d_in_currency > 0 ? "+":""}{new Number(coin.price_change_percentage_7d_in_currency).toPrecision(3)}%</div>
                            </div>)}
                        </div>
        );
    }

    // mineChain() {
    //     var hashPrevBlock = '000000000000000000000000';
        
    //     var coinbase = "Hazpool";
    //     var chaindata = [];
    //     var newblock = {};
    //     var time = Date.now();
    //     var difficulty = 1000;
    //     while (chaindata.length < 100) {
    //     var nonce = 0;
    //     var hashPrevBlock = nexthash;
    //     var nexthash = (2**256).toString(16);
    //         while (parseInt(nexthash, 16) > (2**256/difficulty)) {
    //             nonce = nonce+1;
    //             time = Date.now();
    //             newblock = {'hashPrevBlock': hashPrevBlock, 'time': time, 'coinbase': coinbase, 'nonce': nonce};
    //             nexthash = CryptoJS.SHA256(JSON.stringify(newblock)).toString();
    //             console.log("mining:", nexthash, newblock);
    //         }
    //         chaindata = chaindata.concat(newblock);
    //         console.log("FOUND BLOCK:", chaindata.length, nexthash, newblock); 
    //     }
    //     console.log("chaindata", chaindata);
    // }

    componentWillMount() {
        this.getCoinsData();
    }

    componentDidMount() {
        if (_.isEmpty(this.state.coins) ) {
            this.getCoinsData();
        }
        //this.mineChain();
    
        this.interval = setInterval(() => {
          this.getCoinsData()
            }, 20000);
        }
    
      componentWillUnmount() {
          clearInterval(this.interval);
    }

  render() {
    
    return(
        <div className="shifted">
            <div className="feed-layout container">
                <Affix className="leftContainer" stickPosition={77}>
                    <div className="left">
                    <LeftSidebar />
                    </div>
                </Affix>
                <div className = "center">   
                    {this.displayCoins()}
                </div>
                <Affix className="rightContainer" stickPosition={77}>
                    <div className="right">
                        <RightSidebar />
                    </div>
                </Affix>
            </div>
        </div>
      );
  }
}

export default Coins;