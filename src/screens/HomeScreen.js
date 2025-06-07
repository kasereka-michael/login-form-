import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, ImageBackground, Dimensions, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Button, Text, Surface, Title, Card, IconButton, Avatar, ProgressBar, Divider, Chip } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/authService';

// Get screen dimensions for responsive design
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const HomeScreen = ({ navigation }) => {
  // State for user data, API data, and loading/error states
  const [user, setUser] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [sensorData, setSensorData] = useState(null); // New state for sensor data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Professional farm dashboard background image
  const dashboardBackgroundImage = {
    uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZmFybSUyMGxhbmRzY2FwZXxlbnwwfHwwfHw%3D&w=1000&q=80',
  };

  // Weather icons mapping
  const weatherIcons = {
    Sunny: 'weather-sunny',
    'Partly Cloudy': 'weather-partly-cloudy',
    Cloudy: 'weather-cloudy',
    Rainy: 'weather-rainy',
    Stormy: 'weather-lightning-rainy',
    Snowy: 'weather-snowy',
  };

  // Map Open-Meteo WMO weather codes to conditions and icons
  const mapWeatherCode = (code) => {
    switch (code) {
      case 0: return { condition: 'Sunny', icon: 'weather-sunny' };
      case 1:
      case 2: return { condition: 'Partly Cloudy', icon: 'weather-partly-cloudy' };
      case 3: return { condition: 'Cloudy', icon: 'weather-cloudy' };
      case 45:
      case 48: return { condition: 'Cloudy', icon: 'weather-cloudy' };
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65: return { condition: 'Rainy', icon: 'weather-rainy' };
      case 71:
      case 73:
      case 75:
      case 77: return { condition: 'Snowy', icon: 'weather-snowy' };
      case 80:
      case 81:
      case 82:
      case 95:
      case 96:
      case 99: return { condition: 'Stormy', icon: 'weather-lightning-rainy' };
      default: return { condition: 'Sunny', icon: 'weather-sunny' };
    }
  };

  // Map Open-Meteo daily forecast to UI format
  const mapDailyForecast = (dailyData) => {
    if (!dailyData || !dailyData.time) return [];
    return dailyData.time.map((time, index) => {
      const date = new Date(time);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayName,
        temp: Math.round(dailyData.temperature_2m_max[index]),
        condition: mapWeatherCode(dailyData.weather_code[index]).condition,
      };
    }).slice(1, 4); // Show next 3 days
  };

  // Fetch user and farm data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch current user
        const userResponse = await authService.getCurrentUser();
        console.log('User Data Fetched:', userResponse);
        setUser(userResponse.user);

        // Assume user profile includes coordinates
        const latitude = userResponse.user?.latitude || 0.375; // Fallback: Near Kampala, Uganda
        const longitude = userResponse.user?.longitude || 32.625;

        // Fetch weather data
        const weatherResponse = await authService.fetchWeatherData(latitude, longitude);
        console.log('Weather Data Fetched:', weatherResponse);
        const mappedWeather = {
          temperature: weatherResponse.current.temperature_2m,
          humidity: weatherResponse.current.relative_humidity_2m,
          condition: mapWeatherCode(weatherResponse.current.weather_code).condition,
          forecast: mapDailyForecast(weatherResponse.daily),
        };
        setWeatherData(mappedWeather);

        // Fetch soil and crop data
        const soilResponse = await authService.fetchSoilData();
        console.log('Soil Data Fetched:', soilResponse);
        setSoilData(soilResponse);

        const cropResponse = await authService.fetchCropData();
        console.log('Crop Data Fetched:', cropResponse);
        setCropData(cropResponse);

        // Fetch sensor data
        const sensorResponse = await authService.fetchSensorData();
        console.log('Sensor Data Fetched:', sensorResponse);
        setSensorData(sensorResponse.content); // Store only the content array
      } catch (err) {
        console.error('Fetch Data Error:', {
          message: err.message,
          response: err.response
              ? {
                status: err.response.status,
                statusText: err.response.statusText,
                data: err.response.data,
              }
              : 'No response from server - check network or server status',
          stack: err.stack,
        });
        let errorMessage = 'Failed to load dashboard data.';
        if (err.message.includes('Network Error')) {
          errorMessage = 'Unable to connect to the server. Check your internet or try again.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigation]);

  // Refresh data function
  const handleRefresh = async (type) => {
    try {
      setLoading(true);
      setError('');
      if (type === 'weather') {
        const latitude = user?.latitude || 0.375;
        const longitude = user?.longitude || 32.625;
        const response = await authService.fetchWeatherData(latitude, longitude);
        console.log('Weather Refresh Response:', response);
        setWeatherData({
          temperature: response.current.temperature_2m,
          humidity: response.current.relative_humidity_2m,
          condition: mapWeatherCode(response.current.weather_code).condition,
          forecast: mapDailyForecast(response.daily),
        });
      } else if (type === 'soil') {
        const response = await authService.fetchSoilData();
        console.log('Soil Refresh Response:', response);
        setSoilData(response);
      } else if (type === 'sensor') {
        const response = await authService.fetchSensorData();
        console.log('Sensor Refresh Response:', response);
        setSensorData(response.content);
      }
    } catch (err) {
      console.error('Refresh Error:', {
        message: err.message,
        response: err.response
            ? {
              status: err.response.status,
              statusText: err.response.statusText,
              data: err.response.data,
            }
            : 'No response from server - check network or server status',
        stack: err.stack,
      });
      let errorMessage = `Failed to refresh ${type} data.`;
      if (err.message.includes('Network Error')) {
        errorMessage = 'Unable to connect to the server. Check your internet or try again.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logout Initiated at:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      await authService.logout();
      console.log('Logout Successful');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout Error Details:', {
        message: error.message,
        response: error.response
            ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
            : 'No response from server - check network or server status',
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Fallback data if API fails
  const fallbackWeather = {
    temperature: 28,
    humidity: 65,
    condition: 'Sunny',
    forecast: [
      { day: 'Sun', temp: 29, condition: 'Sunny' },
      { day: 'Mon', temp: 27, condition: 'Partly Cloudy' },
      { day: 'Tue', temp: 26, condition: 'Rainy' },
    ],
  };
  const fallbackSoil = {
    moisture: 0.72,
    ph: 6.8,
    nutrients: { nitrogen: 0.65, phosphorus: 0.48, potassium: 0.58 },
    resistance: 0.35,
  };
  const fallbackCrop = {
    currentCrop: 'Corn',
    plantingDate: '2023-04-15',
    harvestEstimate: '2023-08-30',
    growthStage: 'Vegetative',
    healthStatus: 'Good',
  };
  const fallbackSensors = [
    {
      id: 1,
      name: 'Fallback Sensor',
      location: 'Field 1',
      status: 'ACTIVE',
    },
  ];

  return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <ImageBackground source={dashboardBackgroundImage} style={styles.backgroundImage}>
          {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#2e7d32" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
              </View>
          )}

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <LinearGradient
                colors={['rgba(46, 125, 50, 0.9)', 'rgba(200, 230, 201, 0.85)']}
                style={styles.headerGradient}
            >
              <View style={styles.headerContainer}>
                <View style={styles.headerTextContainer}>
                  <Title style={styles.welcomeTitle}>
                    Welcome, {user?.firstName || ' to Smart-A'}!
                  </Title>
                  <Text style={styles.subtitle}>Real-time farm monitoring</Text>
                </View>
                <Avatar.Image
                    size={60}
                    source={require('../../assets/icon.png')}
                    style={styles.headerAvatar}
                />
              </View>
            </LinearGradient>

            {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  {error.includes('Unable to connect') && (
                      <TouchableOpacity onPress={() => handleRefresh('sensor')}>
                        <Text style={styles.retryText}>Retry</Text>
                      </TouchableOpacity>
                  )}
                </View>
            )}

            <View style={styles.cardsContainer}>
              {/* Weather Card */}
              <Card style={styles.card}>
                <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.cardGradient}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleContainer}>
                        <IconButton icon="weather-partly-cloudy" size={24} color="#2e7d32" style={styles.cardIcon} />
                        <Title style={styles.cardTitle}>Weather Conditions</Title>
                      </View>
                      <IconButton icon="refresh" size={20} onPress={() => handleRefresh('weather')} disabled={loading} />
                    </View>
                    <View style={styles.weatherMain}>
                      <View style={styles.weatherCurrentContainer}>
                        <IconButton
                            icon={weatherIcons[weatherData?.condition || fallbackWeather.condition] || 'weather-sunny'}
                            size={40}
                            color="#2e7d32"
                        />
                        <Text style={styles.weatherTemp}>
                          {Math.round(weatherData?.temperature || fallbackWeather.temperature)}°C
                        </Text>
                        <Text style={styles.weatherCondition}>
                          {weatherData?.condition || fallbackWeather.condition}
                        </Text>
                        <Text style={styles.weatherHumidity}>
                          Humidity: {Math.round(weatherData?.humidity || fallbackWeather.humidity)}%
                        </Text>
                      </View>
                      <View style={styles.weatherForecastContainer}>
                        {(weatherData?.forecast || fallbackWeather.forecast).map((day, index) => (
                            <View key={index} style={styles.forecastDay}>
                              <Text style={styles.forecastDayName}>{day.day}</Text>
                              <IconButton
                                  icon={weatherIcons[day.condition] || 'weather-sunny'}
                                  size={20}
                                  color="#2e7d32"
                                  style={styles.forecastIcon}
                              />
                              <Text style={styles.forecastTemp}>{day.temp}°C</Text>
                              <Text style={styles.forecastCondition}>{day.condition}</Text>
                            </View>
                        ))}
                      </View>
                    </View>
                  </Card.Content>
                </LinearGradient>
              </Card>

              {/* Sensor Data Card */}
              <Card style={styles.card}>
                <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.cardGradient}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleContainer}>
                        <IconButton icon="access-point" size={24} color="#2e7d32" style={styles.cardIcon} />
                        <Title style={styles.cardTitle}>Sensors</Title>
                      </View>
                      <IconButton icon="refresh" size={20} onPress={() => handleRefresh('sensor')} disabled={loading} />
                    </View>
                    <View style={styles.sensorContainer}>
                      {(sensorData || fallbackSensors).map((sensor) => (
                          <View key={sensor.id} style={styles.sensorItem}>
                            <View style={styles.sensorInfo}>
                              <Text style={styles.sensorName}>{sensor.name}</Text>
                              <Text style={styles.sensorLocation}>Location: {sensor.location}</Text>
                            </View>
                            <Chip
                                style={[
                                  styles.sensorStatus,
                                  sensor.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive,
                                ]}
                                textStyle={styles.sensorStatusText}
                            >
                              {sensor.status}
                            </Chip>
                          </View>
                      ))}
                    </View>
                  </Card.Content>
                </LinearGradient>
              </Card>

              {/* Soil Quality Card */}
              <Card style={styles.card}>
                <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.cardGradient}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleContainer}>
                        <IconButton icon="water-percent" size={24} color="#2e7d32" style={styles.cardIcon} />
                        <Title style={styles.cardTitle}>Soil Quality</Title>
                      </View>
                      <IconButton icon="refresh" size={20} onPress={() => handleRefresh('soil')} disabled={loading} />
                    </View>
                    <View style={styles.soilContainer}>
                      <View style={styles.soilMetricContainer}>
                        <Text style={styles.soilMetricLabel}>Moisture</Text>
                        <ProgressBar
                            progress={soilData?.moisture || fallbackSoil.moisture}
                            color="#2e7d32"
                            style={styles.progressBar}
                        />
                        <Text style={styles.soilMetricValue}>
                          {Math.round((soilData?.moisture || fallbackSoil.moisture) * 100)}%
                        </Text>
                      </View>
                      <View style={styles.soilMetricContainer}>
                        <Text style={styles.soilMetricLabel}>pH Level</Text>
                        <View style={styles.phContainer}>
                          <View
                              style={[styles.phIndicator, { left: `${((soilData?.ph || fallbackSoil.ph) / 14) * 100}%` }]}
                          />
                          <View style={styles.phScale}>
                            <Text style={styles.phValue}>Acidic</Text>
                            <Text style={styles.phValue}>{(soilData?.ph || fallbackSoil.ph).toFixed(1)}</Text>
                            <Text style={styles.phValue}>Alkaline</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Card.Content>
                </LinearGradient>
              </Card>

              {/* Soil Nutrients Card */}
              <Card style={styles.card}>
                <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.cardGradient}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleContainer}>
                        <IconButton icon="leaf" size={24} color="#2e7d32" style={styles.cardIcon} />
                        <Title style={styles.cardTitle}>Soil Nutrients</Title>
                      </View>
                    </View>
                    <View style={styles.nutrientsContainer}>
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientLabel}>Nitrogen (N)</Text>
                        <ProgressBar
                            progress={soilData?.nutrients?.nitrogen || fallbackSoil.nutrients.nitrogen}
                            color="#4CAF50"
                            style={styles.progressBar}
                        />
                        <Text style={styles.nutrientValue}>
                          {Math.round((soilData?.nutrients?.nitrogen || fallbackSoil.nutrients.nitrogen) * 100)}%
                        </Text>
                      </View>
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientLabel}>Phosphorus (P)</Text>
                        <ProgressBar
                            progress={soilData?.nutrients?.phosphorus || fallbackSoil.nutrients.phosphorus}
                            color="#2196F3"
                            style={styles.progressBar}
                        />
                        <Text style={styles.nutrientValue}>
                          {Math.round((soilData?.nutrients?.phosphorus || fallbackSoil.nutrients.phosphorus) * 100)}%
                        </Text>
                      </View>
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientLabel}>Potassium (K)</Text>
                        <ProgressBar
                            progress={soilData?.nutrients?.potassium || fallbackSoil.nutrients.potassium}
                            color="#FF9800"
                            style={styles.progressBar}
                        />
                        <Text style={styles.nutrientValue}>
                          {Math.round((soilData?.nutrients?.potassium || fallbackSoil.nutrients.potassium) * 100)}%
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </LinearGradient>
              </Card>

              {/* Soil Resistance Card */}
              <Card style={styles.card}>
                <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.cardGradient}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleContainer}>
                        <IconButton icon="resistor" size={24} color="#2e7d32" style={styles.cardIcon} />
                        <Title style={styles.cardTitle}>Soil Resistance</Title>
                      </View>
                    </View>
                    <View style={styles.resistanceContainer}>
                      <ProgressBar
                          progress={soilData?.resistance || fallbackSoil.resistance}
                          color="#F44336"
                          style={styles.resistanceBar}
                      />
                      <Text style={styles.resistanceValue}>
                        {Math.round((soilData?.resistance || fallbackSoil.resistance) * 100)}%
                      </Text>
                      <Text style={styles.resistanceDescription}>
                        {(soilData?.resistance || fallbackSoil.resistance) < 0.3
                            ? 'Low resistance - Good for planting'
                            : (soilData?.resistance || fallbackSoil.resistance) < 0.5
                                ? 'Medium resistance - Moderate difficulty for roots'
                                : 'High resistance - May impede root growth'}
                      </Text>
                    </View>
                  </Card.Content>
                </LinearGradient>
              </Card>

              {/* Crop Information Card */}
              <Card style={styles.card}>
                <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.cardGradient}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleContainer}>
                        <IconButton icon="sprout" size={24} color="#2e7d32" style={styles.cardIcon} />
                        <Title style={styles.cardTitle}>
                          Current Crop: {cropData?.currentCrop || fallbackCrop.currentCrop}
                        </Title>
                      </View>
                    </View>
                    <Divider style={styles.divider} />
                    <View style={styles.cropInfoContainer}>
                      <View style={styles.cropInfoItem}>
                        <Text style={styles.cropInfoLabel}>Planting Date:</Text>
                        <Text style={styles.cropInfoValue}>
                          {formatDate(cropData?.plantingDate || fallbackCrop.plantingDate)}
                        </Text>
                      </View>
                      <View style={styles.cropInfoItem}>
                        <Text style={styles.cropInfoLabel}>Harvest Estimate:</Text>
                        <Text style={styles.cropInfoValue}>
                          {formatDate(cropData?.harvestEstimate || fallbackCrop.harvestEstimate)}
                        </Text>
                      </View>
                      <View style={styles.cropInfoItem}>
                        <Text style={styles.cropInfoLabel}>Growth Stage:</Text>
                        <Text style={styles.cropInfoValue}>
                          {cropData?.growthStage || fallbackCrop.growthStage}
                        </Text>
                      </View>
                      <View style={styles.cropInfoItem}>
                        <Text style={styles.cropInfoLabel}>Health Status:</Text>
                        <Text
                            style={[
                              styles.cropInfoValue,
                              (cropData?.healthStatus || fallbackCrop.healthStatus) === 'Good'
                                  ? styles.healthGood
                                  : (cropData?.healthStatus || fallbackCrop.healthStatus) === 'Fair'
                                      ? styles.healthFair
                                      : styles.healthPoor,
                            ]}
                        >
                          {cropData?.healthStatus || fallbackCrop.healthStatus}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </LinearGradient>
              </Card>
            </View>

            <Button
                mode="contained"
                onPress={handleLogout}
                style={styles.logoutButton}
                icon="logout"
                disabled={loading}
            >
              Logout
            </Button>
          </ScrollView>
        </ImageBackground>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
    color: '#2e7d32',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  headerGradient: {
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    elevation: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerAvatar: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'white',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 10,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    flex: 1,
  },
  retryText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardsContainer: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  cardGradient: {
    borderRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    margin: 0,
    padding: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  weatherMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 10,
  },
  weatherCurrentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  weatherCondition: {
    fontSize: 18,
    marginVertical: 5,
  },
  weatherHumidity: {
    fontSize: 14,
    color: '#666',
  },
  weatherForecastContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  forecastDay: {
    alignItems: 'center',
  },
  forecastDayName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  forecastIcon: {
    margin: 0,
    padding: 0,
  },
  forecastTemp: {
    fontSize: 14,
  },
  forecastCondition: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  sensorContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 10,
  },
  sensorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  sensorLocation: {
    fontSize: 14,
    color: '#666',
  },
  sensorStatus: {
    paddingHorizontal: 8,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusInactive: {
    backgroundColor: '#f44336',
  },
  sensorStatusText: {
    fontSize: 12,
    color: 'white',
  },
  soilContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 10,
  },
  soilMetricContainer: {
    marginBottom: 15,
  },
  soilMetricLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  soilMetricValue: {
    fontSize: 14,
    textAlign: 'right',
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  phContainer: {
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    position: 'relative',
    marginVertical: 10,
  },
  phIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2e7d32',
    position: 'absolute',
    top: -5,
    marginLeft: -5,
    zIndex: 1,
  },
  phScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    alignItems: 'center',
    height: '100%',
  },
  phValue: {
    fontSize: 12,
    color: '#555',
  },
  nutrientsContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 10,
  },
  nutrientItem: {
    marginBottom: 10,
  },
  nutrientLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    fontWeight: 'bold',
  },
  nutrientValue: {
    fontSize: 14,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  resistanceContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 10,
  },
  resistanceBar: {
    height: 15,
    borderRadius: 7.5,
    marginVertical: 10,
  },
  resistanceValue: {
    fontSize: 16,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#f44336',
  },
  resistanceDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  divider: {
    marginVertical: 10,
  },
  cropInfoContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 10,
  },
  cropInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cropInfoLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: 'bold',
  },
  cropInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  healthGood: {
    color: '#4CAF50',
  },
  healthFair: {
    color: '#FF9800',
  },
  healthPoor: {
    color: '#f44336',
  },
  logoutButton: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#f44336',
    borderRadius: 8,
    elevation: 3,
  },
});

export default HomeScreen;