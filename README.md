# MMM-WeatherdotcomForecast

> [!WARNING]
> **Disclaimer:** This module is a fork of MMM-NOAAForecast, whose edits and feature additions were implemented with the assistance of Google Gemini. The changes in this fork were made with the assistance of Claude. Please use with caution and test thoroughly in your own setup.

A weather module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) that displays current conditions, hourly and daily forecasts and weather alerts. It's a fork of [MMM-NOAAForecast](https://github.com/bl8demast3r/MMM-NOAAForecast) that displays the weather data shared by [MMM-Weatherdotcom](https://github.com/bl8demast3r/MMM-Weatherdotcom): [Weather.com](https://weather.com/) data, with [NOAA](https://www.weather.gov/documentation/services-web-api) as a backup.

![Screenshot](screenshots/MMM-WeatherdotcomForecast.png?raw=true "Screenshot")

This module incorporates code and inspiration from [MMM-OpenWeatherForecast](https://github.com/Tom-Hirschberger/MMM-OpenWeatherForecast) by Tom Hirschberger, licensed under the MIT License.

**NOTE:** This module uses the Nunjucks templating system introduced in version 2.2.0 of MagicMirror. If you're seeing nothing on your display where you expect this module to appear, make sure your MagicMirror version is at least 2.2.0.

## Requirements

> [!IMPORTANT]
> **[MMM-Weatherdotcom](https://github.com/bl8demast3r/MMM-Weatherdotcom) is a required module.** It polls Weather.com (and NOAA as a backup) for weather data; this module doesn't poll anything itself. MMM-Weatherdotcom also provides the weather icons.
>
> **A Weather.com API key must be purchased directly from Weather.com (The Weather Company).** No API keys are included in this repository. The key goes in the MMM-Weatherdotcom configuration. Without a key, MMM-Weatherdotcom uses NOAA only, which covers the United States and its territories.

## Installation

Install [MMM-Weatherdotcom](https://github.com/bl8demast3r/MMM-Weatherdotcom) first, then:

```sh
cd ~/MagicMirror/modules
git clone https://github.com/bl8demast3r/MMM-WeatherdotcomForecast.git
```

There are no dependencies to install for running the module.

## Weather sources

MMM-Weatherdotcom fetches the weather from Weather.com. If Weather.com fails (for example, because the API key stops working), it falls back to NOAA for that update and tries Weather.com again on the next one. Without an API key, NOAA is always used.

The attribution line at the bottom of the module shows:

- **Updated**: when the current conditions were observed by the weather source, not when the data was fetched. For Weather.com this is the time of its latest observation; for NOAA, the time of the latest weather station observation.
- **Forecast Updated**: when the National Weather Service published the forecast. Only shown while NOAA is in use, because Weather.com doesn't publish an issue time for its forecasts.
- **Expires**: when Weather.com says the data is due to be refreshed (the earliest `expirationTimeUtc` of the current conditions and forecasts), usually about 10 minutes after the observation. MMM-Weatherdotcom polls on its own interval, so this time may already have passed when it is shown. NOAA publishes no expiration time, so it isn't shown while NOAA is in use.
- **Source**: `Weather.com`, `NOAA (backup)` or `NOAA`. The source is highlighted when the NOAA backup is in use, and `(offline)` is added when every source failed and the last good data is shown.

![The module while the NOAA backup is in use](screenshots/noaa-backup.png?raw=true "NOAA backup")

| | Weather.com | NOAA |
|:-|:------------|:-----|
| Coverage | worldwide | United States and its territories only |
| Current conditions | Weather.com's current observation | the forecast for the current hour, with the latest station observation time |
| Pressure and UV index | yes | only where NOAA's gridpoint data includes them |
| Daily high / low | the day's high and the following night's low, as shown on weather.com | the warmest/coldest of the day's hourly forecast and NOAA's official high/low |
| Precipitation amounts | 15 days | 2 to 3 days, depending on your local NWS forecast office |
| Units | converted to `units` | textual NOAA data such as wind speed ranges is in imperial units, so the output may be mixed (but with units clearly denoted) |

## Configuration

The location, the API key and how often the weather is updated are set in [MMM-Weatherdotcom](https://github.com/bl8demast3r/MMM-Weatherdotcom#configuration). The options below only change how the weather is displayed.

### Options

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>frameWidth</code></td>
      <td>Width of the rendered module column, in pixels. Increase to align with neighbouring modules in the same region.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>300</code></td>
    </tr>
    <tr>
      <td><code>updateFadeSpeed</code></td>
      <td>How quickly in milliseconds to fade the module out and in upon data refresh.  Set this to <code>0</code> for no fade.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>500</code> (i.e.: 1/2 second).</td>
    </tr>
    <tr>
      <td><code>colored</code></td>
      <td>Whether to present module in colour or black-and-white.  Note, if set to <code>false</code>, the monochramtic version of your chosen icon set will be forced if it exist.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showCurrentConditions</code></td>
      <td>Whether to show current temperaure and current conditions icon.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showExtraCurrentConditions</code></td>
      <td>Whether to show additional current conditions such as high/low temperatures, precipitation, wind speed, humidity, dew point, sunrise, sunset, etc.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>extraCurrentConditions</code></td>
      <td>An object allowing you to fine-tune individual extra conditions to show/hide:<br>
      <code>{ highLowTemp: true, precipitation: true, sunrise: true, sunset: true, wind: true, barometricPressure: false, humidity: true, dewPoint: true, uvIndex: false, visibility: false }</code><br><br><strong>Type</strong> <code>Object</code></td>
    </tr>
    <tr>
      <td><code>showAttribution</code></td>
      <td>Whether to display the attribution and last updated time at the bottom right.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showLastUpdate</code></td>
      <td>Whether to include update timestamps in the attribution footer.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showCurrentConditionsLastUpdate</code></td>
      <td>Whether to show when the current conditions were observed by the weather source (Weather.com, or the NOAA weather station).<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showExpires</code></td>
      <td>Whether to show when Weather.com says the data is due to be refreshed. See <a href="#weather-sources">Weather sources</a>.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showForecastLastUpdate</code></td>
      <td>Whether to show when the National Weather Service published the forecast for this location. Only shown while the NOAA backup is in use; Weather.com doesn't publish an issue time for its forecasts.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showSource</code></td>
      <td>Whether to show the weather source in use in the attribution line: <code>Weather.com</code>, <code>NOAA (backup)</code> or <code>NOAA</code>. See <a href="#weather-sources">Weather sources</a>.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>attributionText</code></td>
      <td>Additional text displayed at the end of the attribution line.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>""</code></td>
    </tr>
    <tr>
      <td><code>showSummary</code></td>
      <td>Whether to show the forecast summary.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showAlerts</code></td>
      <td>Whether to show active weather alerts/advisories.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>maxAlertsToShow</code></td>
      <td>Maximum number of active alerts to display (set to <code>0</code> to display all active alerts).<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>0</code></td>
    </tr>
    <tr>
      <td><code>forecastHeaderText</code></td>
      <td>Show a header above the forecast display.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>""</code></td>
    </tr>
    <tr>
      <td><code>showForecastTableColumnHeaderIcons</code></td>
      <td>Whether to show icons column headers on the forecast table.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showHourlyForecast</code></td>
      <td>Whether to show hourly forecast information. when set to <code>true</code> it works with the <code>hourlyForecastInterval</code> and <code>maxHourliesToShow</code> parameters.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>hourlyForecastInterval</code></td>
      <td>How many hours apart each listed hourly forecast is.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>3</code></td>
    </tr>
    <tr>
      <td><code>maxHourliesToShow</code></td>
      <td>How many hourly forecasts to list.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>3</code></td>
    </tr>
    <tr>
      <td><code>showDailyForecast</code></td>
      <td>Whether to show daily forecast information. when set to <code>true</code> it works with the <code>maxDailiesToShow</code> parameter.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>maxDailiesToShow</code></td>
      <td>How many daily forecasts to list.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>3</code></td>
    </tr>
    <tr>
      <td><code>showPrecipitation</code></td>
      <td>Whether to show precipitation information. This affects current conditions, hourly and daily forecasts. In <code>table</code> layout, hourly and daily rows stack accumulation beneath the precipitation chance so narrow columns stay readable.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showPrecipitationStartStop</code></td>
      <td>Whether to show when precipitation (rain or snow) is expected to start or stop. When enabled, the module analyzes hourly forecast data and displays a notification below the summary such as "Rain expected at 3 PM" or "Snow ending by 6 PM" if a change is detected within the next 24 hours.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>false</code></td>
    </tr>
    <tr>
      <td><code>showWind</code></td>
      <td>Whether to show wind information. This affects current conditions, hourly and daily forecasts<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>concise</code></td>
      <td>When set to <code>true</code>, this presents less information.  (e.g.: shorter summary, no precipitation accumulation, no wind gusts, etc.)<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>iconset</code></td>
      <td>Which icon set to use, from the sets bundled with MMM-Weatherdotcom. See the <a href="https://github.com/bl8demast3r/MMM-Weatherdotcom#icon-sets">icon set previews</a>.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>1c</code></td>
    </tr>
    <tr>
      <td><code>mainIconset</code></td>
      <td>Which icon set to use for current weather.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>iconset value</code></td>
    </tr>
    <tr>
      <td><code>useAnimatedIcons</code></td>
      <td> *** <strong>LEGACY, please use icon set '6fa' or '6oa' for animated icons ***</strong> <p>Whether to use the Dark Sky's own animated icon set.  When set to true, this will override your choice for <code>iconset</code>. However, flat icons will still be used in some instances.  For example if you set the <code>animateMainIconOnly</code> parameter to true, daily and hourly forecasts will not be animated and instead will use your choice for <code>iconset</code>.  Inline icons (i.e. used to prefix precipitation and wind information) will always be flat.  A good <code>iconset</code> match for the animated set is <code>1c</code>.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>animateMainIconOnly</code></td>
      <td>When set to <code>true</code>, only the main current conditions icon is animated. The rest use your choice for <code>iconset</code> (<code>1c</code> is a good match for the animated icon).  If you are running on a low-powered device like a Raspberry Pi, performance may suffer if you set this to <code>false</code>.  In my testing on a Pi 3b, enabling this ramped up CPU temperature by 15° - 20°, and fade transitions were not smooth.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showInlineIcons</code></td>
      <td>Whether to prefix wind and precipitation information with an icon.  Only affects the <code>tiled</code> layout.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>forecastLayout</code></td>
      <td>Can be set to <code>tiled</code> or <code>table</code>. How to display hourly and forecast information.  See below for screenshot examples of each.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>tiled</code></td>
    </tr>
    <tr>
      <td><code>label_gust</code></td>
      <td>The label you wish to display for prefixing wind gusts.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"max"</code>.</td>
    </tr>
    <tr>
      <td><code>label_high</code></td>
      <td>The label you wish to display for prefixing high temperature.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"H"</code>.</td>
    </tr>
    <tr>
      <td><code>label_low</code></td>
      <td>The label you wish to display for prefixing low temperature.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"L"</code>.</td>
    </tr>
    <tr>
      <td><code>label_timeFormat</code></td>
      <td>How you want the time formatted for hourly forecast display.  Accepts any valid moment.js format (https://momentjs.com/docs/#/displaying/format/). For example, specify short 24h format with <code>"k[h]"</code> (e.g.: <code>14h</code>)<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"HH:mm"</code> (e.g.: <code>21:00</code>), or <code>"h a"</code> (e.g.: <code>9 pm</code>) when MagicMirror's global <code>timeFormat</code> is <code>12</code></td>
    </tr>
    <tr>
      <td><code>label_sunTimeFormat</code></td>
      <td>How you want Sunrise and Sunset formatted.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"HH:mm"</code> (e.g.: <code>06:05</code>), or <code>"h:mm a"</code> (e.g.: <code>6:05 am</code>) when MagicMirror's global <code>timeFormat</code> is <code>12</code></td>
    </tr>
    <tr>
      <td><code>label_lastUpdateTimeFormat</code></td>
      <td>How you want the update and expiration times formatted.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"HH:mm"</code> (e.g.: <code>21:51</code>), or <code>"h:mm a"</code> (e.g.: <code>9:51 pm</code>) when MagicMirror's global <code>timeFormat</code> is <code>12</code></td>
    </tr>
    <tr>
      <td><code>label_currentConditionsUpdate</code></td>
      <td>Label for the time the current conditions were observed.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"Updated"</code></td>
    </tr>
    <tr>
      <td><code>label_forecastUpdate</code></td>
      <td>Label for the time the forecast was published (NOAA only).<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"Forecast Updated"</code></td>
    </tr>
    <tr>
      <td><code>label_expires</code></td>
      <td>Label for the time the data expires (Weather.com only).<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"Expires"</code></td>
    </tr>
    <tr>
      <td><code>label_source</code></td>
      <td>Label prefixing the weather source.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"Source:"</code></td>
    </tr>
    <tr>
      <td><code>label_offline</code></td>
      <td>Shown after the source when every source failed and the last good data is displayed.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"offline"</code></td>
    </tr>
    <tr>
      <td><code>label_days</code></td>
      <td>How you would like the days of the week displayed for daily forecasts.  Assumes index <code>0</code> is Sunday.<br><br><strong>Type</strong> <code>Array of Strings</code><br>Defaults to <code>["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"]</code></td>
    </tr>
    <tr>
      <td><code>label_ordinals</code></td>
      <td>How you would like wind direction to be displayed.  Assumes index <code>0</code> is North and proceeds clockwise.<br><br><strong>Type</strong> <code>Array of Strings</code><br>Defaults to <code>["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]</code></td>
    </tr>

  </tbody>
</table>
## Sample Configuration

```js
{
  module: "MMM-Weatherdotcom",
  config: {
    apiKey: "<your Weather.com API key>",
    lat: "51.506130",
    lon: "-0.090270"
  }
},
{
  module: "MMM-WeatherdotcomForecast",
  header: "Weather",
  position: "top_right",
  config: {
    iconset: "4c",
    concise: false,
    forecastLayout: "table"
  }
},
```

## Icon Sets

The icon sets are bundled with MMM-Weatherdotcom. See its [icon set previews](https://github.com/bl8demast3r/MMM-Weatherdotcom#icon-sets).

## Styling

The module's width is controlled by the [`frameWidth`](#configuration) config option (default `300px`). Set it to match the width of neighbouring modules in the same region — raise it if you have a wider sibling module so the columns line up.

### Visual conventions

- **Today / next-upcoming accent.** The first hourly row receives an amber (`#f5b041`) left border and time label; if `includeTodayInDailyForecast` is enabled, today's daily row receives the same accent on its day name. This mirrors the convention used by sibling modules so the eye finds "now" instantly.
- **Single divider between hourly and daily.** Per-row borders have been replaced with row spacing and one divider between the hourly and daily sections — less line noise, easier scanning at a glance.
- **Column-header icons replace inline icons in table rows.** When `showForecastTableColumnHeaderIcons: true` and `forecastLayout: "table"`, the precipitation and wind icons rendered inline in each row are suppressed, since the column headers already convey the same signal.
- **"Feels like" temperature is labelled.** The current-conditions row reads e.g. `52°  FEELS LIKE 47°` so the secondary temperature is unambiguous.

### Custom overrides

Most important elements of this module have one or more class names applied. Examine the `MMM-WeatherdotcomForecast.css` file or inspect elements directly with your browser of choice to determine what class you would like to override from your `custom.css`.

## Tests

```sh
npm install
npm test
```

The tests include real Weather.com and NOAA data, captured through MMM-Weatherdotcom.

## Attributions

Forked from [MMM-NOAAForecast](https://github.com/bl8demast3r/MMM-NOAAForecast) by Marcus Markiewicz and bl8demast3r (MIT License).

**Skycons - Animated icon set by Dark Sky**<br />
http://darkskyapp.github.io/skycons/<br />
(using the fork created by Maxime Warner that allows individual details of the icons to be colored<br />
https://github.com/maxdow/skycons)

**Weather icon sets**, bundled with MMM-Weatherdotcom:<br />
Climacons by Adam Whitcroft (http://adamwhitcroft.com/climacons/),
Free Weather Icons by Svilen Petrov (https://www.behance.net/gallery/12410195/Free-Weather-Icons),
Weather Icons by Thom, designed for DuckDuckGo (https://dribbble.com/shots/1832162-Weather-Icons),
sets 4 and 5 from Graphberry whose original artists couldn't be found (https://www.graphberry.com/item/weather-icons, https://www.graphberry.com/item/weathera-weather-forecast-icons),
and Meteocons by Bas Milius for sets 6fa and 6oa (https://github.com/basmilius/weather-icons).
See the [MMM-Weatherdotcom attributions](https://github.com/bl8demast3r/MMM-Weatherdotcom#attributions) for details.

**[MMM-OpenWeatherForecast](https://github.com/Tom-Hirschberger/MMM-OpenWeatherForecast)** by Tom Hirschberger
is licensed under the MIT License.<br />

**Data from [Weather.com](https://weather.com/)** and **[NOAA](https://www.weather.gov/documentation/services-web-api)**, via MMM-Weatherdotcom.
