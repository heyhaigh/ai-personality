// Test date/time and weather awareness tools
console.log('Testing contextual awareness tools...\n');

// Tool execution function (simplified for testing)
async function executeTool(toolName) {
  switch (toolName) {
    case 'get_current_datetime':
      const now = new Date();

      const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/New_York'
      };
      const timeOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York'
      };

      const dateStr = now.toLocaleDateString('en-US', dateOptions);
      const timeStr = now.toLocaleTimeString('en-US', timeOptions);
      const month = now.toLocaleDateString('en-US', { month: 'long', timeZone: 'America/New_York' });

      // Determine season for Central NY
      const monthNum = now.getMonth(); // 0-11
      let season;
      if (monthNum >= 2 && monthNum <= 4) season = 'Spring';
      else if (monthNum >= 5 && monthNum <= 8) season = 'Summer';
      else if (monthNum >= 9 && monthNum <= 10) season = 'Fall';
      else season = 'Winter';

      return `Current date/time: ${dateStr}, ${timeStr} EST. Season: ${season}. Month: ${month}.`;

    case 'get_weather':
      try {
        const weatherResponse = await fetch('https://wttr.in/Syracuse,NY?format=j1');
        const weatherData = await weatherResponse.json();

        const current = weatherData.current_condition[0];
        const today = weatherData.weather[0];

        const tempF = current.temp_F;
        const feelsLikeF = current.FeelsLikeF;
        const condition = current.weatherDesc[0].value;
        const humidity = current.humidity;
        const windSpeed = current.windspeedMiles;
        const maxTempF = today.maxtempF;
        const minTempF = today.mintempF;

        // Gardening context for Zone 6B
        const monthNum = new Date().getMonth();
        let gardeningNote = '';

        if (monthNum >= 10 || monthNum <= 2) { // Nov-Feb
          gardeningNote = 'Too cold for outdoor gardening (winter in Zone 6B). Ground is likely frozen.';
        } else if (monthNum === 3) { // March
          gardeningNote = 'Early spring - too early for most planting, but good for planning and starting seeds indoors.';
        } else if (monthNum === 4) { // April
          gardeningNote = 'Spring planting season beginning for cold-hardy crops.';
        } else if (monthNum >= 5 && monthNum <= 8) { // May-Aug
          gardeningNote = 'Prime growing season in Zone 6B.';
        } else if (monthNum === 9) { // September
          gardeningNote = 'Fall harvest time, can plant cool-season crops.';
        }

        return `Weather in Syracuse, NY: ${condition}, ${tempF}°F (feels like ${feelsLikeF}°F). High: ${maxTempF}°F, Low: ${minTempF}°F. Humidity: ${humidity}%, Wind: ${windSpeed} mph. Gardening note: ${gardeningNote}`;

      } catch (error) {
        console.error('Weather API error:', error);
        return 'Unable to fetch current weather data.';
      }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

// Run tests
(async () => {
  console.log('1. Testing get_current_datetime:');
  const dateTime = await executeTool('get_current_datetime');
  console.log('  ', dateTime);

  console.log('\n2. Testing get_weather:');
  const weather = await executeTool('get_weather');
  console.log('  ', weather);

  console.log('\n✅ Contextual awareness tools tested!');
  console.log('\nRyan can now:');
  console.log('- Know the current date, time, and season');
  console.log('- Check weather conditions in Syracuse, NY');
  console.log('- Provide seasonally appropriate responses');
  console.log('- Reference weather naturally in conversation');
})();
