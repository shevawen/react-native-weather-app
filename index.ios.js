'use strict';

var React = require('react-native');
var Dimensions = require('Dimensions');
var Common = require('./common/common');
var WeekView = require('./components/WeekView');
var Chart = require('./components/Chart');
var LoadingOverlay = require('./components/LoadingOverlay');


var {
    AppRegistry,
    StyleSheet,
    Text,
    View,
} = React;

var WeatherApp = React.createClass({
    statics: {
        flex : [2,1,6,6]
    },
    getInitialState: function() {
        var windowSize = Dimensions.get('window');
        var flexItemHeight = windowSize.height / WeatherApp.flex.reduce(function(a, b){return a+b;});
        return {
            current: {
                city: "",
                weather: "",
                temp: "",
                date: "",
                icon: ""
            },
            weekViewData: [],
            chartWidth: windowSize.width,
            chartHeight: flexItemHeight * 2,
            chartTop: flexItemHeight * 11,
            //chartData: [[],[]], TODO: can not fire binding,why?
            chartData: null,
            chartLineColors : ["#d35400","#a0dcdc"],
            chartPointFillColors : ["#e67e22","#a0dcdc"],
            chartPointStrokeColors : ["#d35400","#ffffff"],
            isOverlayVisible: true,
        }
    },
    getCurrent: function(data){
        var now = Date.now();
        var current = data.list.filter(function(item) {
            return Math.abs(item.dt * 1000 - now) < (3 * 60 * 60 * 1000); // less than 3 hrs
        })[0];
        var _today = Common.today(now);
        return {
            city: data.city.name + ',' + data.city.country,
            weather: current.weather[0].description,
            temp: Common.f2c(current.main.temp),
            date: _today[1] + '.' + _today[2] + ' ' + _today[0],
            icon: Common.icon(current.weather[0].icon)
        }
    },
    componentDidMount: function () {
        var that = this;
        fetch("http://api.openweathermap.org/data/2.5/forecast?q=Shanghai,cn&lang=zh_cn")
            .then((response) => response.json())
            .then(function(data) {
                var current = that.getCurrent(data);

                var chartData = [];
                var temp_max_arr = [];
                var temp_min_arr = [];
                Common.week(data.list).map((item, index) => {
                    temp_max_arr.push(item.max);
                    temp_min_arr.push(item.min);
                });
                chartData.push(temp_max_arr);
                chartData.push(temp_min_arr);

                chartData.map((item, index) => {
                    item.push(item[0]);
                    item.unshift(item[0]);
                });

                that.setState({
                    current: current,
                    chartData: chartData,
                    weekViewData: data.list,
                    isOverlayVisible: false,
                });
            })
            .catch((error) => {
                //errorFunc && errorFunc(error);
            })
            .done();
    },
    render: function() {
        return (
          <View style = { styles.container }>
            <View style = { styles.city_day }>
                <Text style = { styles.city_day_text }> 
                  { this.state.current.city } / { this.state.current.date }
                </Text>
            </View>
            <Text style = { styles.status }>
              { this.state.current.weather } { this.state.current.temp }° 
            </Text> 
            <Text style = { [styles.current, styles.weather_icon] }> 
              { this.state.current.icon } 
            </Text>
            <WeekView data={this.state.weekViewData} flex={WeatherApp.flex.slice(3)}/>
            <Chart 
                    data={this.state.chartData} 
                    width={this.state.chartWidth} 
                    height={this.state.chartHeight}
                    top={this.state.chartTop}
                    pointFillColors={this.state.chartPointFillColors}
                    pointStrokeColors={this.state.chartPointStrokeColors}
                    lineColors={this.state.chartLineColors}
                     />
            <LoadingOverlay isVisible={this.state.isOverlayVisible} />
          </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3d566e',
        flexDirection: 'column'
    },
    city_day: {
        flex: WeatherApp.flex[0],
        alignItems: 'center',
        flexDirection: 'row',
    },
    city_day_text: {
        justifyContent: 'center',
        alignSelf: 'auto',
        flex: 1,
        fontSize: 20,
        textAlign: 'center',
        color: '#95a5a6',
    },
    status: {
        flex: WeatherApp.flex[1],
        fontSize: 20,
        textAlign: 'center',
        color: '#f1c40f',
        fontWeight: 'bold',
    },
    current: {
        textAlign: 'center',
        fontSize: 130,
        color: '#ffffff',
        flex: WeatherApp.flex[2]
    },
    weather_icon: {
        fontFamily: 'WeatherIcons-Regular',
    },
});

AppRegistry.registerComponent('WeatherApp', () => WeatherApp);