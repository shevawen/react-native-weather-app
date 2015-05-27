'use strict';

var React = require('react-native');
var d3 = require('d3');
var Svg = require('react-native-svg'); 
var Path = Svg.Path;

var {
    AppRegistry,
    StyleSheet,
    Text,
    View,
} = React;

var WeatherApp = React.createClass({
    getInitialState: function() {
        return {
            current: {
                city: "",
                weather: "",
                temp: "",
                date: "",
                icon: ""
            },
            chart: {},
            containerSize: {},
            chartPositonY: 0,
            chartHeight: 60
        }
    },
    render: function() {
        var that = this;
        var data = {};
        var current = {};
        var _current = [];
        var temp_max_arr = [];
        var temp_min_arr = [];
        fetch("http://api.openweathermap.org/data/2.5/forecast?q=Shanghai,cn&lang=zh_cn")
            .then(function(response) {
                data = JSON.parse(response._bodyText);
                _current = data.list.filter(function(item) {
                    var now = Date.now();
                    return Math.abs(item.dt * 1000 - now) < (3 * 60 * 60 * 1000); // less than 3 hrs
                })[0];
                var _today = today(Date.now());
                current = {
                    city: data.city.name + ',' + data.city.country,
                    weather: _current.weather[0].description,
                    temp: f2c(_current.main.temp),
                    date: _today[1] + '.' + _today[2] + ' ' + _today[0],
                    icon: icon(_current.weather[0].icon)
                }
                var days = week(data.list).map((item, index) => {
                    temp_max_arr.push(item.max);
                    temp_min_arr.push(item.min);

                    var day = 
                        <Text style={ styles.day }>
                            { item.week }
                        </Text>
                    var iconUp = 
                        <Text style = {[styles.day_icon, styles.weather_icon]}>
                            { item.iconUp }
                        </Text>
                    var iconDown = 
                        <Text style = {[styles.day_icon, styles.weather_icon]}>
                            { item.iconDown }
                        </Text>
                    var date = 
                        <Text style={ styles.date }>
                            { item.date }
                        </Text>
                    return (
                        <View style={ styles.dayCol } key={item.week}>
                          {day}
                          {iconUp}
                          <View style={{flex: 2}} onLayout={(event) => {
                              that.state.chartPositonY = 0 - event.nativeEvent.layout.height * 2;
                              that.state.chartHeight = event.nativeEvent.layout.height;
                            }}/>
                          {iconDown}
                          {date}
                        </View>
                    );
                });
                temp_max_arr.push(temp_max_arr[0]);
                temp_max_arr.unshift(temp_max_arr[0]);
                temp_min_arr.push(temp_min_arr[0]);
                temp_min_arr.unshift(temp_min_arr[0]);
                var domain = [
                    d3.max([d3.max(temp_max_arr), d3.max(temp_min_arr)]),
                    d3.min([d3.min(temp_max_arr), d3.min(temp_min_arr)])
                ]
                var chart = 
                    <Svg width={that.state.containerSize.width} height={that.state.chartHeight} forceUpdate="0" 
                        style={{
                            positon: 'absolute',
                            width: that.state.containerSize.width, 
                            height: that.state.chartHeight, 
                            top: that.state.chartPositonY,
                            left: 0, 
                            backgroundColor:'transparent'}}>
                        <Path fill="none" stroke="#d35400" strokeWidth="2" strokeMiterlimit="10"
                        d={path(temp_max_arr, domain, that.state.containerSize.width, 60)} />
                        <Path fill="none" stroke="#a0dcdc" strokeWidth="2" strokeMiterlimit="10"
                        d={path(temp_min_arr, domain, that.state.containerSize.width, 60)} />
                    </Svg>;
                that.setState({
                    current: current,
                    days: days,
                    chart: chart
                });

            })
            .then(function(responseObj) {

            })
            .catch((error) => {
                //errorFunc && errorFunc(error);
            })
            .done();

        return ( 
          <View style = { styles.container } onLayout={(event) => {
              var {width, height} = event.nativeEvent.layout;
              this.state.containerSize.width = width;
              this.state.containerSize.height = height;
            }}>
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
            <View style = { styles.week }>
                { this.state.days }
            </View>
            { this.state.chart }
          </View>
        );
    }
});

function path(data, domain, width, height){
    var x = d3.scale.linear().domain([0, data.length - 1]).range([0, width]);
    var y = d3.scale.linear().domain(domain).range([0, height]);
    var line = d3.svg.line().x(function(d,i) { 
            return x(i); 
        }).y(function(d) { 
            return y(d);
        })
    .interpolate("basis");
    return line(data);
}
// to C
function f2c(temp) {
    return parseInt(temp - 273.15);
}

function today(str) {
        var d = new Date(str);
        return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getDay()]
    }
    // find a right icon
var icon = (function(code) {
    var map = {
        '01d': '\uf00d', // clear sky
        '02d': '\uf002', // few clouds
        '03d': '\uf041', // scattered clouds
        '04d': '\uf013', // broken clouds
        '09d': '\uf019', // shower rain
        '10d': '\uf008', // rain
        '11d': '\uf016', // thunderstorm
        '13d': '\uf064', // snow
        '50d': '\uf014', // mist
        '01n': '\uf077',
        '02n': '\uf086',
        '03n': '\uf041',
        '04n': '\uf031',
        '09n': '\uf028',
        '10n': '\uf028',
        '11n': '\uf016',
        '13n': '\uf016',
        '50n': '\uf014'
    };

    return function weatherIcon(code) {
        return map[code] || '\uf03e';
    };
})();

// map week
var day = (function() {
    var map = ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'];
    return function(index) {
        return map[index];
    };
})();

var week = function (list) {
    var arr = []
    var obj = {};

    list.forEach(function (current) {
      var t = today(current.dt * 1000);
      var id = t[2];

      if (!obj[id]) return obj[id] = {
        min: f2c(current.main.temp_min),
        max: f2c(current.main.temp_max),
        iconUp: icon(current.weather[0].icon),
        iconDown: icon(current.weather[0].icon),
        week: day(t[3]),
        date: t[1] + '/' + t[2]
      };

      obj[id].min = Math.min(f2c(current.main.temp_min), obj[id].min);
      obj[id].max = Math.max(f2c(current.main.temp_max), obj[id].max);
      obj[id].iconDown = icon(current.weather[0].icon);
    });

    Object.keys(obj).sort(function (a, b) {
      return a - b;
    }).forEach(function (id) {
      arr.push(obj[id]);
    });

    return arr;
};

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3d566e',
        flexDirection: 'column'
    },
    city_day: {
        flex: 1,
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
        fontSize: 20,
        textAlign: 'center',
        color: '#f1c40f',
        fontWeight: 'bold',
    },
    current: {
        textAlign: 'center',
        fontSize: 130,
        color: '#ffffff',
        flex: 4
    },
    dayCol: {
        borderRightColor: '#4d667e',
        borderRightWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'column',
    },
    weather_icon: {
        fontFamily: 'WeatherIcons-Regular',
    },
    week: {
        flexDirection: 'row',
        flex: 4
    },
    day_icon: {
        fontSize: 20,
        color: '#ffffff',
        flex: 1,
    },
    day: {
        fontSize: 12,
        color: '#ffffff',
        flex: 1,
    },
    date: {
        fontSize: 12,
        color: '#ffffff',
        flex: 1,
    }
});

AppRegistry.registerComponent('WeatherApp', () => WeatherApp);