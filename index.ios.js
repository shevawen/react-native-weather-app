'use strict';

var React = require('react-native');
var d3 = require('d3');

var {
    AppRegistry,
    StyleSheet,
    Text,
    Image,
    View,
} = React;

var WeatherApp = React.createClass({
    getInitialState: function() {
        return {
            current: {
                city: "loading",
                weather: "loading",
                temp: "",
                date: "",
                icon: ""
            }
        }
    },
    render: function() {
        var that = this;
        var data = {};
        var current = {};
        var _current = [];
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
                    var day = 
                        <Text style={ styles.day }>
                            { item.week }
                        </Text>
                    var icon = 
                        <Text style = {[styles.day_icon, styles.weather_icon]}>
                            { item.iconUp }
                        </Text>
                    var date = 
                        <Text style={ styles.date }>
                            { item.date }
                        </Text>
                    return (
                        <View style={ styles.dayCol }>
                          {day}
                          {icon}
                          {date}
                        </View>
                    );
                });
                that.setState({
                    current: current,
                    days: days
                });

            })
            .then(function(responseObj) {

            })
            .catch((error) => {
                //errorFunc && errorFunc(error);
            })
            .done();

        return ( 
          <View style = { styles.container }>
            <Text style = { styles.city_day }> 
              { this.state.current.city } / { this.state.current.date }
            </Text>
            <Text style = { styles.status }>
              { this.state.current.weather } { this.state.current.temp }° 
            </Text> 
            <Text style = { [styles.current, styles.weather_icon] }> 
              { this.state.current.icon } 
            </Text> 
            <View style = { styles.week }>
              { this.state.days }
            </View>
          </View>
        );
    }
});
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
var drawSine = function(t) {
  var path = `M ${0} ${Math.sin(t) * 2}`;
  var x, y;

  for (var i = 0; i <= 10; i += 0.5) {
    x = i * 2;
    y = Math.sin(t + x) * 2;
    path = path + ` L ${x} ${y}`
  }

  return path;
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3d566e',
    },
    city_day: {
        fontSize: 20,
        textAlign: 'center',
        color: '#95a5a6',
        marginTop: 60,
    },
    status: {
        fontSize: 20,
        textAlign: 'center',
        color: '#f1c40f',
        marginTop: 60,
        fontWeight: 'bold',
        marginBottom: 50,
    },
    current: {
        textAlign: 'center',
        fontSize: 150,
        color: '#ffffff',
        marginBottom: 50,
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
    },
    day_icon: {
        fontSize: 20,
        color: '#ffffff',
        marginTop: 10
    },
    day: {
        fontSize: 12,
        color: '#ffffff',
    },
    date: {
        fontSize: 12,
        color: '#ffffff',
        marginTop: 10
    }
});

AppRegistry.registerComponent('WeatherApp', () => WeatherApp);