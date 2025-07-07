import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

export default function App() {
  const [country, setCountry] = useState('IN');
  const [city, setCity] = useState('Delhi');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showInputs, setShowInputs] = useState(true);

  // Country-city data
  const countryData = [
    { key: 'IN', value: 'India' },
    { key: 'US', value: 'United States' },
    { key: 'GB', value: 'United Kingdom' },
  ];

  const cityData = {
    IN: [
      { key: 'Delhi', value: 'Delhi' },
      { key: 'Mumbai', value: 'Mumbai' },
      { key: 'Bangalore', value: 'Bangalore' },
      { key: 'Patna', value: 'Patna' },
      { key: 'Jabalpur', value: 'Jabalpur' },
      { key: 'Jalandhar', value: 'Jalandhar' },
    ],
    US: [
      { key: 'New York', value: 'New York' },
      { key: 'Los Angeles', value: 'Los Angeles' },
      { key: 'Chicago', value: 'Chicago' },
    ],
    GB: [
      { key: 'London', value: 'London' },
      { key: 'Manchester', value: 'Manchester' },
      { key: 'Birmingham', value: 'Birmingham' },
    ],
  };

  // Secure API key
  const API_KEY = Constants.expoConfig?.extra?.WEATHER_API_KEY;
  console.log('API_KEY:', API_KEY); 
  const fetchWeather = async () => {
    if (!API_KEY) {
      setErrorMsg('API key is missing. Please set WEATHER_API_KEY in your .env file.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setWeather(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${API_KEY}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
        setShowInputs(false);
      } else {
        setErrorMsg('Failed to fetch weather data');
      }
    } catch (error) {
      setErrorMsg('Error fetching weather data');
    }
    setLoading(false);
  };

  // Determine weather animation
  const getWeatherAnimation = () => {
    if (!weather) return null;
    const weatherCondition = weather.weather[0].main.toLowerCase();
    if (weatherCondition.includes('clear')) {
      return require('./assets/animations/sunny.json');
    } else if (weatherCondition.includes('cloud')) {
      return require('./assets/animations/cloudy.json');
    } else if (weatherCondition.includes('rain')) {
      return require('./assets/animations/rain.json');
    }
    return require('./assets/animations/cloudy.json');
  };

  const resetSelection = () => {
    setShowInputs(true);
    setWeather(null);
    setErrorMsg(null);
    setCountry('IN');
    setCity('Delhi');
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <SafeAreaView style={styles.innerContainer}>
        {weather && !showInputs && (
          <View style={styles.header}>
            <Text style={styles.cityText}>
              {weather.name}, {country}
            </Text>
            <TouchableOpacity onPress={resetSelection}>
              <Text style={styles.changeLocation}>Change Location</Text>
            </TouchableOpacity>
          </View>
        )}

        {showInputs && (
          <View style={styles.inputContainer}>
            <Text style={styles.title}>Select Country and City</Text>
            <View style={styles.dropdownContainer}>
              <SelectList
                setSelected={(val) => {
                  setCountry(val);
                  setCity(cityData[val][0].key);
                }}
                data={countryData}
                save="key"
                placeholder="Select Country"
                boxStyles={styles.dropdownBox}
                inputStyles={styles.dropdownText}
                dropdownStyles={styles.dropdown}
                dropdownTextStyles={styles.dropdownText}
                defaultOption={countryData.find((item) => item.key === country)}
              />
            </View>
            <View style={styles.dropdownContainer}>
              <SelectList
                setSelected={(val) => setCity(val)}
                data={cityData[country]}
                save="key"
                placeholder="Select City"
                boxStyles={styles.dropdownBox}
                inputStyles={styles.dropdownText}
                dropdownStyles={styles.dropdown}
                dropdownTextStyles={styles.dropdownText}
                defaultOption={cityData[country].find((item) => item.key === city)}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={fetchWeather}>
              <Text style={styles.buttonText}>Get Weather</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.spinnerText}>Loading Weather...</Text>
          </View>
        )}

        {errorMsg && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchWeather}>
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {weather && !loading && !errorMsg && (
          <View style={styles.weatherContainer}>
            <LottieView
              source={getWeatherAnimation()}
              autoPlay
              loop
              style={styles.display}
            />
            <View style={styles.weatherCard}>
              <Text style={styles.titleCard}>Weather in {weather.name}</Text>
              <Text style={styles.textCard}>Temperature: {weather.main.temp}°C</Text>
              <Text style={styles.textCard}>Weather: {weather.weather[0].description}</Text>
              <Text style={styles.textCard}>Humidity: {weather.main.humidity}%</Text>
              <Text style={styles.textCard}>Wind Speed: {weather.wind.speed} m/s</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cityText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  changeLocation: {
    fontSize: 16,
    color: '#add8e6',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  dropdownContainer: {
    width: '80%',
    marginBottom: 15,
  },
  dropdownBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdown: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  dropdownText: {
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  spinnerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  spinnerText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  weatherContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  display: {
    width: 150,
    height: 150,
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  titleCard: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  textCard: {
    fontSize: 18,
    color: '#333',
    marginVertical: 5,
  },
});