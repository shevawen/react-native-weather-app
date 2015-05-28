module.exports = {
	// find a right icon
	icon : (function(code) {
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
	})(),
	// map week
	day : (function() {
	    var map = ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'];
	    return function(index) {
	        return map[index];
	    };
	})(),

	week : function(list) {
	    var arr = []
	    var obj = {};
	    var that = this;
	    list.forEach(function (current) {
	      var t = that.today(current.dt * 1000);
	      var id = t[2];

	      if (!obj[id]) return obj[id] = {
	        min: that.f2c(current.main.temp_min),
	        max: that.f2c(current.main.temp_max),
	        iconUp: that.icon(current.weather[0].icon),
	        iconDown: that.icon(current.weather[0].icon),
	        week: that.day(t[3]),
	        date: t[1] + '/' + t[2]
	      };

	      obj[id].min = Math.min(that.f2c(current.main.temp_min), obj[id].min);
	      obj[id].max = Math.max(that.f2c(current.main.temp_max), obj[id].max);
	      obj[id].iconDown = that.icon(current.weather[0].icon);
	    });

	    Object.keys(obj).sort(function (a, b) {
	      return a - b;
	    }).forEach(function (id) {
	      arr.push(obj[id]);
	    });

	    return arr;
	},
	// to C
	f2c: function(temp) {
	    return parseInt(temp - 273.15);
	},
	today: function(str) {
        var d = new Date(str);
        return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getDay()]
	}
}