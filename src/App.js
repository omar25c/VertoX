import React, { useState, useEffect } from 'react';
import { Calendar, Cloud, Sun, CloudRain, AlertTriangle, MapPin, TrendingUp, BarChart3 } from 'lucide-react';

const WeatherApp = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [location, setLocation] = useState('Berlin');
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anomalies, setAnomalies] = useState([]);

  // German cities for location selection
  const germanCities = [
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart',
    'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden',
    'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld'
  ];

  // Mock weather conditions for simulation
  const weatherConditions = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'snowy'];
  
  // Generate mock historical data
  const generateHistoricalData = (targetDate, targetTime) => {
    const data = [];
    const date = new Date(targetDate);
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    
    // Generate 10 years of historical data for this date
    for (let year = 2014; year <= 2023; year++) {
      const historicalDate = new Date(year, date.getMonth(), date.getDate());
      const seasonalBias = Math.sin((dayOfYear / 365) * 2 * Math.PI);
      
      // Create weather pattern based on season and location
      let condition;
      const random = Math.random() + seasonalBias * 0.3;
      
      if (date.getMonth() >= 5 && date.getMonth() <= 8) { // Summer
        condition = random > 0.7 ? 'sunny' : random > 0.4 ? 'cloudy' : 'rainy';
      } else if (date.getMonth() >= 11 || date.getMonth() <= 2) { // Winter
        condition = random > 0.6 ? 'cloudy' : random > 0.3 ? 'rainy' : 'snowy';
      } else { // Spring/Fall
        condition = random > 0.5 ? 'cloudy' : random > 0.3 ? 'rainy' : 'sunny';
      }
      
      data.push({
        year,
        date: historicalDate.toISOString().split('T')[0],
        condition,
        temperature: Math.round(15 + seasonalBias * 10 + (Math.random() - 0.5) * 20),
        humidity: Math.round(50 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 25)
      });
    }
    
    return data;
  };

  // Generate current forecast
  const generateCurrentForecast = (targetDate, targetTime, location) => {
    const date = new Date(targetDate);
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const seasonalBias = Math.sin((dayOfYear / 365) * 2 * Math.PI);
    
    const random = Math.random() + seasonalBias * 0.2;
    let condition;
    
    if (date.getMonth() >= 5 && date.getMonth() <= 8) {
      condition = random > 0.6 ? 'sunny' : random > 0.3 ? 'cloudy' : 'rainy';
    } else if (date.getMonth() >= 11 || date.getMonth() <= 2) {
      condition = random > 0.5 ? 'cloudy' : random > 0.2 ? 'rainy' : 'snowy';
    } else {
      condition = random > 0.4 ? 'cloudy' : random > 0.2 ? 'rainy' : 'sunny';
    }
    
    return {
      condition,
      temperature: Math.round(15 + seasonalBias * 10 + (Math.random() - 0.5) * 15),
      humidity: Math.round(50 + Math.random() * 35),
      windSpeed: Math.round(Math.random() * 20),
      pressure: Math.round(1013 + (Math.random() - 0.5) * 40),
      visibility: Math.round(8 + Math.random() * 7),
      confidence: Math.round(75 + Math.random() * 20)
    };
  };

  // Detect anomalies by comparing current forecast with historical patterns
  const detectAnomalies = (currentForecast, historicalData) => {
    const anomalies = [];
    
    // Calculate historical averages
    const avgTemp = historicalData.reduce((sum, d) => sum + d.temperature, 0) / historicalData.length;
    const avgHumidity = historicalData.reduce((sum, d) => sum + d.humidity, 0) / historicalData.length;
    const avgWindSpeed = historicalData.reduce((sum, d) => sum + d.windSpeed, 0) / historicalData.length;
    
    // Check for temperature anomalies
    if (Math.abs(currentForecast.temperature - avgTemp) > 10) {
      anomalies.push({
        type: 'Temperature Anomaly',
        severity: Math.abs(currentForecast.temperature - avgTemp) > 15 ? 'High' : 'Medium',
        description: `Temperature ${currentForecast.temperature}°C is ${Math.abs(currentForecast.temperature - avgTemp).toFixed(1)}°C ${currentForecast.temperature > avgTemp ? 'above' : 'below'} historical average (${avgTemp.toFixed(1)}°C)`
      });
    }
    
    // Check for humidity anomalies
    if (Math.abs(currentForecast.humidity - avgHumidity) > 25) {
      anomalies.push({
        type: 'Humidity Anomaly',
        severity: 'Medium',
        description: `Humidity ${currentForecast.humidity}% differs significantly from historical average (${avgHumidity.toFixed(1)}%)`
      });
    }
    
    // Check for wind speed anomalies
    if (Math.abs(currentForecast.windSpeed - avgWindSpeed) > 10) {
      anomalies.push({
        type: 'Wind Speed Anomaly',
        severity: currentForecast.windSpeed > avgWindSpeed + 15 ? 'High' : 'Medium',
        description: `Wind speed ${currentForecast.windSpeed} km/h is unusually ${currentForecast.windSpeed > avgWindSpeed ? 'high' : 'low'} for this date`
      });
    }
    
    return anomalies;
  };

  const analyzeWeather = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const historical = generateHistoricalData(selectedDate, selectedTime);
    const current = generateCurrentForecast(selectedDate, selectedTime, location);
    const detectedAnomalies = detectAnomalies(current, historical);
    
    setHistoricalData(historical);
    setWeatherData(current);
    setAnomalies(detectedAnomalies);
    setLoading(false);
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-400" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-400" />;
      default: return <Cloud className="w-6 h-6 text-gray-400" />;
    }
  };

  const calculateConditionStats = (historical, condition) => {
    const occurrences = historical.filter(d => d.condition === condition).length;
    return `${occurrences}/10 times`;
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'sunny': return 'text-yellow-400';
      case 'cloudy': return 'text-gray-400';
      case 'rainy': return 'text-blue-400';
      case 'snowy': return 'text-white';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Weather Automation & Forecasting
          </h1>
          <p className="text-gray-400">Advanced weather analysis with historical pattern detection for Germany</p>
        </div>

        {/* Input Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {germanCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={analyzeWeather}
                disabled={!selectedDate || loading}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200"
              >
                {loading ? 'Analyzing...' : 'Analyze Weather'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Fetching weather data and analyzing patterns...</p>
          </div>
        )}

        {/* Results */}
        {weatherData && historicalData && !loading && (
          <div className="space-y-6">
            {/* Current Forecast */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
                Current Forecast - {location}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getWeatherIcon(weatherData.condition)}
                  </div>
                  <h3 className="font-semibold capitalize">{weatherData.condition}</h3>
                  <p className="text-sm text-gray-400">Condition</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{weatherData.temperature}°C</div>
                  <p className="text-sm text-gray-400">Temperature</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{weatherData.humidity}%</div>
                  <p className="text-sm text-gray-400">Humidity</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{weatherData.windSpeed} km/h</div>
                  <p className="text-sm text-gray-400">Wind Speed</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-xl font-bold text-purple-400">{weatherData.pressure} hPa</div>
                  <p className="text-sm text-gray-400">Pressure</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-xl font-bold text-cyan-400">{weatherData.visibility} km</div>
                  <p className="text-sm text-gray-400">Visibility</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-xl font-bold text-yellow-400">{weatherData.confidence}%</div>
                  <p className="text-sm text-gray-400">Confidence</p>
                </div>
              </div>
            </div>

            {/* Historical Analysis */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
                Historical Pattern Analysis (2014-2023)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-300">Weather Condition Probability</h3>
                  <div className="space-y-2">
                    {weatherConditions.map(condition => {
                      const count = historicalData.filter(d => d.condition === condition).length;
                      const percentage = (count / historicalData.length * 100).toFixed(1);
                      return (
                        <div key={condition} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getWeatherIcon(condition)}
                            <span className={`capitalize ${getConditionColor(condition)}`}>{condition}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{count}/10 years</span>
                            <span className="text-sm text-gray-400 ml-2">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-300">Historical Averages</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Temperature:</span>
                      <span className="font-medium text-orange-400">
                        {(historicalData.reduce((sum, d) => sum + d.temperature, 0) / historicalData.length).toFixed(1)}°C
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Humidity:</span>
                      <span className="font-medium text-blue-400">
                        {(historicalData.reduce((sum, d) => sum + d.humidity, 0) / historicalData.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Wind Speed:</span>
                      <span className="font-medium text-green-400">
                        {(historicalData.reduce((sum, d) => sum + d.windSpeed, 0) / historicalData.length).toFixed(1)} km/h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Probability Statement */}
              <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Statistical Insight</h3>
                <p className="text-gray-300">
                  It's forecasted <span className={`font-semibold ${getConditionColor(weatherData.condition)}`}>
                    {weatherData.condition}
                  </span>, but historically this date has been <span className="font-semibold">
                    {weatherData.condition} {calculateConditionStats(historicalData, weatherData.condition)}
                  </span> over the last decade in {location}.
                </p>
              </div>
            </div>

            {/* Anomaly Detection */}
            {anomalies.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-red-400" />
                  Detected Anomalies
                </h2>
                <div className="space-y-3">
                  {anomalies.map((anomaly, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      anomaly.severity === 'High' 
                        ? 'bg-red-900/30 border-red-500' 
                        : 'bg-yellow-900/30 border-yellow-500'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold ${
                          anomaly.severity === 'High' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {anomaly.type}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          anomaly.severity === 'High' 
                            ? 'bg-red-800 text-red-200' 
                            : 'bg-yellow-800 text-yellow-200'
                        }`}>
                          {anomaly.severity} Risk
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{anomaly.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {anomalies.length === 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-green-400" />
                  Pattern Analysis
                </h2>
                <div className="p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
                  <p className="text-green-300">
                    <span className="font-semibold">No significant anomalies detected.</span> 
                    The forecasted conditions align well with historical patterns for this date and location.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;