/**
 * Tests for displaying the data shared by MMM-Weatherdotcom.
 *
 * The fixtures are real WEATHERDOTCOM_DATA payloads for Central Park, New York
 * City: one from Weather.com and one from the NOAA backup (taken with an
 * invalid Weather.com API key). The clock is set to when they were fetched,
 * and expected values are read from the fixtures where possible, so the
 * fixtures can be captured again with MMM-Weatherdotcom.
 */

const moment = require("moment");

global.moment = moment;
global.Module = {
  register: jest.fn((moduleName, moduleDefinition) => {
    global.MMM_WeatherdotcomForecast = moduleDefinition;
  })
};
global.config = { units: "imperial", timeFormat: 12 };
global.Log = { info: jest.fn(), log: jest.fn(), warn: jest.fn(), error: jest.fn() };

require("../MMM-WeatherdotcomForecast.js");

const weathercomPayload = require("./fixtures/weathercom_payload.json");
const noaaPayload = require("./fixtures/noaa_payload.json");
const wc = weathercomPayload.weathercom;

const ICON_PATH = "modules/MMM-Weatherdotcom/icons";
const clone = (o) => JSON.parse(JSON.stringify(o));
const dateKey = (epochSeconds) => moment.unix(epochSeconds).format("YYYY-MM-DD");
// Hour labels the way the module formats them: in the forecast location's time zone
const hourLabel = (validTimeLocal, addHours = 0) => {
  const time = moment.parseZone(validTimeLocal).add(addHours, "hour");
  return time.format("h a") + (time.isSame(moment(), "day") ? "" : " tomorrow");
};

describe("MMM-Weatherdotcom data", () => {
  let module;

  beforeAll(() => {
    jest.useFakeTimers({ doNotFake: ["setInterval", "clearInterval"] });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // When the Weather.com fixture was fetched
    jest.setSystemTime(new Date(weathercomPayload.fetchedAt));
    module = Object.create(global.MMM_WeatherdotcomForecast);
    module.config = {
      ...global.MMM_WeatherdotcomForecast.defaults,
      units: "imperial",
      concise: true,
      useAnimatedIcons: false,
      showPrecipitationStartStop: true
    };
    module.extraCurrentConditions = module.config.extraCurrentConditions;
    module.identifier = "test_module_weathercom";
    module.iconIdCounter = 0;
    module.iconPath = module.defaultIconPath;
    module.location = { lat: null, lon: null };
    module.updateDom = jest.fn();
    module.sendNotification = jest.fn();
    module.translate = jest.fn((key) => key);
  });

  const receive = (payload) => {
    module.notificationReceived(
      "WEATHERDOTCOM_DATA",
      Object.assign(clone(payload), { iconPath: "/" + ICON_PATH })
    );
    return module.formattedWeatherData;
  };

  const todayIndex = () =>
    wc.daily.validTimeUtc.findIndex((t) => dateKey(t) === moment().format("YYYY-MM-DD"));

  describe("from Weather.com", () => {
    it("shows the current observation", () => {
      const result = receive(weathercomPayload);
      const current = wc.current;

      expect(result.currently.temperature).toBe(`${current.temperature}°`);
      expect(result.currently.feelslike).toBe(`${current.temperatureFeelsLike}°`);
      expect(result.currently.iconPath).toBe(`/${ICON_PATH}/1c/${current.iconName}.svg`);
      expect(result.currently.humidity).toBe(`${current.relativeHumidity}%`);
      expect(result.currently.dewPoint).toBe(`${current.temperatureDewPoint}°`);
      expect(result.currently.barometricPressure).toBe(
        `${current.pressureAltimeter.toFixed(2)} inHg`
      );
      expect(result.currently.visibility).toBe(`${current.visibility} mi`);
      expect(result.currently.uvIndex).toBe(`${current.uvIndex}`);
      expect(result.currently.sunrise).toBe(moment.unix(current.sunriseTimeUtc).format("h:mm a"));
      expect(result.currently.sunset).toBe(moment.unix(current.sunsetTimeUtc).format("h:mm a"));
      // Today's calendar-day high / low
      expect(result.currently.tempRange).toEqual({
        high: `${wc.daily.calendarDayTemperatureMax[todayIndex()]}°`,
        low: `${wc.daily.calendarDayTemperatureMin[todayIndex()]}°`
      });
      // The first daypart with a forecast
      expect(result.summary).toBe(wc.daily.daypart[0].wxPhraseLong.find((v) => v !== null));
    });

    it("formats wind like the NOAA path", () => {
      module.config.concise = false;
      const payload = clone(weathercomPayload);
      payload.weathercom.current.windSpeed = 12;
      payload.weathercom.current.windDirectionCardinal = "NW";
      payload.weathercom.current.windGust = 23;
      const result = receive(payload);

      expect(result.currently.wind.windSpeed).toBe("12 mph NW");
      expect(result.currently.wind.windGust).toBe(" (max 23 mph)");
    });

    it("shows no gust when Weather.com has none for that hour", () => {
      module.config.concise = false;
      const payload = clone(weathercomPayload);
      payload.weathercom.current.windGust = null;
      const result = receive(payload);

      expect(result.currently.wind.windGust).toBeNull();
    });

    it("picks hourly entries every hourlyForecastInterval hours from the current hour", () => {
      const result = receive(weathercomPayload);
      const indexes = [3, 6, 9].map((h) =>
        wc.hourly.validTimeUtc.indexOf(moment().startOf("hour").add(h, "hour").unix())
      );

      expect(result.hourly.map((h) => h.time)).toEqual(
        indexes.map((i) => moment.parseZone(wc.hourly.validTimeLocal[i]).format("h a"))
      );
      expect(result.hourly.map((h) => h.temperature)).toEqual(
        indexes.map((i) => `${wc.hourly.temperature[i]}°`)
      );
      expect(result.hourly[0].isFirst).toBe(true);
      expect(result.hourly[1].iconPath).toBe(
        `/${ICON_PATH}/1c/${wc.hourly.iconName[indexes[1]]}.svg`
      );
      expect(result.hourly[0].precipitation.pop).toBe(`${wc.hourly.precipChance[indexes[0]]}%`);
    });

    it("starts the daily forecast tomorrow by default", () => {
      const result = receive(weathercomPayload);
      const next = (days) => module.config.label_days[moment().add(days, "day").day()];
      const i = todayIndex() + 2; // the day after tomorrow
      const dayPart = wc.daily.daypart[0];

      expect(result.daily.map((d) => d.day)).toEqual([next(1), next(2), next(3)]);
      expect(result.daily[1].tempRange).toEqual({
        high: `${wc.daily.temperatureMax[i]}°`,
        low: `${wc.daily.temperatureMin[i]}°`
      });
      expect(result.daily[1].iconPath).toBe(`/${ICON_PATH}/1c/${dayPart.iconName[2 * i]}.svg`);
      expect(result.daily[1].precipitation.pop).toBe(`${dayPart.precipChance[2 * i]}%`);
    });

    it("shows precipitation amounts in the daily forecast", () => {
      const result = receive(weathercomPayload);
      const first = todayIndex() + 1;
      const rainy = result.daily.findIndex((d, n) => wc.daily.qpf[first + n] > 0);
      expect(rainy).not.toBe(-1);

      expect(result.daily[rainy].precipitation.accumulation).toBe(
        `${wc.daily.qpf[first + rainy]} in`
      );
      expect(result.daily[rainy].precipitation.accumulationType).toBe("rain");
    });

    it("includes today when includeTodayInDailyForecast is set", () => {
      module.config.includeTodayInDailyForecast = true;
      const result = receive(weathercomPayload);
      const i = todayIndex();
      const dayPart = wc.daily.daypart[0];
      // Once the daytime has passed, the night's icon is used
      const icon = dayPart.iconName[2 * i] !== null ? dayPart.iconName[2 * i] : dayPart.iconName[2 * i + 1];

      expect(result.daily[0].isToday).toBe(true);
      expect(result.daily[0].iconPath).toBe(`/${ICON_PATH}/1c/${icon}.svg`);
    });

    it("converts to metric when the hub fetched English units", () => {
      module.config.units = "metric";
      const result = receive(weathercomPayload);
      const current = wc.current;
      const first = todayIndex() + 1;
      const rainy = wc.daily.qpf.findIndex((q, i) => i >= first && q > 0);

      expect(result.currently.temperature).toBe(
        `${Math.round(((current.temperature - 32) * 5) / 9)}°`
      );
      expect(result.currently.barometricPressure).toBe(
        `${Math.round(current.pressureAltimeter * 33.8639)} hPa`
      );
      expect(result.currently.visibility).toBe(
        `${Math.round(current.visibility * 1.609344 * 10) / 10} km`
      );
      expect(result.daily[rainy - first].precipitation.accumulation).toBe(
        `${Math.round(wc.daily.qpf[rainy] * 25.4 * 10) / 10} mm`
      );
    });

    it("shows the observation time published by Weather.com as the update time", () => {
      const result = receive(weathercomPayload);
      const observed = moment.unix(wc.current.validTimeUtc).format("h:mm a");

      // The observation time, not the time the data was fetched
      expect(weathercomPayload.fetchedAt).not.toBe(wc.current.validTimeUtc * 1000);
      expect(result.currentConditionsLastUpdate).toBe(observed);
      // Weather.com publishes no forecast issue time
      expect(result.forecastLastUpdate).toBeNull();
      expect(result.lastUpdate).toBe(observed);
    });

    it("shows when Weather.com says the data expires", () => {
      const result = receive(weathercomPayload);

      expect(result.expires).toBe(moment(weathercomPayload.expiresAt).format("h:mm a"));
    });

    it("labels the observation time simply as Updated", () => {
      expect(module.config.label_currentConditionsUpdate).toBe("Updated");
      expect(module.config.label_expires).toBe("Expires");
    });

    it("reports Weather.com as the source", () => {
      receive(weathercomPayload);

      expect(module.getTemplateData().status).toEqual(
        expect.objectContaining({
          sourceLabel: "Weather.com",
          isFallback: false,
          stale: false
        })
      );
    });

    it("ignores precipitation more than 24 hours away", () => {
      const payload = clone(weathercomPayload);
      payload.weathercom.current.iconName = "clear-day";
      payload.weathercom.hourly.iconName = payload.weathercom.hourly.iconName.map((name, i) =>
        i < 30 ? "cloudy" : "rain"
      );
      const result = receive(payload);

      expect(result.precipitationChange).toBeNull();
    });

    it("detects precipitation starting in the hourly forecast", () => {
      const payload = clone(weathercomPayload);
      payload.weathercom.current.iconName = "cloudy";
      payload.weathercom.hourly.iconName = payload.weathercom.hourly.iconName.map((name, i) =>
        i === 5 ? "rain" : "cloudy"
      );
      const result = receive(payload);

      expect(result.precipitationChange).toEqual(
        expect.objectContaining({
          type: "start",
          precipType: "rain",
          message: `Rain expected at ${hourLabel(wc.hourly.validTimeLocal[5])}`
        })
      );
    });

    it("detects precipitation stopping, starting from the current observation", () => {
      const payload = clone(weathercomPayload);
      payload.weathercom.current.iconName = "snow";
      payload.weathercom.hourly.iconName = payload.weathercom.hourly.iconName.map((name, i) =>
        i < 2 ? "snow" : "cloudy"
      );
      const result = receive(payload);

      // Ends at the end of the last snowy hour
      expect(result.precipitationChange).toEqual(
        expect.objectContaining({
          type: "stop",
          precipType: "snow",
          message: `Snow ending by ${hourLabel(wc.hourly.validTimeLocal[1], 1)}`
        })
      );
    });

    it("formats Weather.com alerts like NOAA alerts", () => {
      const payload = clone(weathercomPayload);
      payload.weathercom.alerts = [
        {
          detailKey: "33cfe586-4178-3c48-8456-32a8c90cefd4",
          eventDescription: "Coastal Flood Statement",
          officeName: "Miami",
          source: "National Weather Service",
          severity: "Minor",
          urgency: "Expected",
          certainty: "Likely",
          headlineText: "Coastal Flood Statement until SAT 12:00 PM EDT",
          summaryHeadline: "Coastal Flood Statement remains for SE FL coast thru Sat am.",
          expireTimeLocal: "2026-10-10T12:00:00-04:00",
          texts: [{ description: " * WHAT...Isolated minor coastal flooding.\n" }]
        },
        {
          detailKey: "no-detail",
          eventDescription: "Wind Advisory",
          source: "National Weather Service",
          summaryHeadline: "Gusty winds this afternoon."
        }
      ];
      const result = receive(payload);

      expect(result.alerts).toHaveLength(2);
      expect(result.alerts[0]).toEqual(
        expect.objectContaining({
          event: "Coastal Flood Statement",
          description: "* WHAT...Isolated minor coastal flooding.",
          sender_name: "NWS Miami",
          severity: "Minor"
        })
      );
      // Without alert details, the summary is shown
      expect(result.alerts[1].description).toBe("Gusty winds this afternoon.");
      expect(result.alerts[1].sender_name).toBe("National Weather Service");
    });
  });

  describe("from the NOAA backup", () => {
    it("shows the NOAA forecast", () => {
      const result = receive(noaaPayload);

      expect(result.currently.temperature).toMatch(/^\d+°$/);
      expect(result.hourly).toHaveLength(3);
      expect(result.daily).toHaveLength(3);
      expect(result.daily[0].day).toBe(
        module.config.label_days[moment().add(1, "day").day()]
      );
    });

    it("shows the times published by NOAA as the update times", () => {
      const result = receive(noaaPayload);

      expect(result.currentConditionsLastUpdate).toBe(
        moment(noaaPayload.currentUpdatedAt).format("h:mm a")
      );
      expect(result.forecastLastUpdate).toBe(
        moment(noaaPayload.forecastUpdatedAt).format("h:mm a")
      );
      // NOAA publishes no expiration time
      expect(result.expires).toBeNull();
    });

    it("reports the fallback in the source status", () => {
      receive(noaaPayload);

      expect(module.getTemplateData().status).toEqual(
        expect.objectContaining({ sourceLabel: "NOAA (backup)", isFallback: true })
      );
    });

    it("uses the location sent with the data for sunrise and sunset", () => {
      const result = receive(noaaPayload);

      expect(module.location).toEqual(noaaPayload.location);
      expect(result.currently.sunrise).toMatch(/^\d{1,2}:\d{2} am$/);
    });
  });

  describe("source status", () => {
    it("marks data as offline when every source failed", () => {
      receive(Object.assign(clone(weathercomPayload), { stale: true, error: "HTTP 401" }));

      expect(module.getTemplateData().status).toEqual(
        expect.objectContaining({ sourceLabel: "Weather.com", stale: true, error: "HTTP 401" })
      );
    });

    it("keeps the previous data when the hub has none to send", () => {
      receive(weathercomPayload);
      const before = module.formattedWeatherData;

      module.notificationReceived("WEATHERDOTCOM_DATA", {
        source: null,
        sourceLabel: "Unavailable",
        error: "NOAA: HTTP 500"
      });

      expect(module.formattedWeatherData).toBe(before);
      expect(global.Log.warn).toHaveBeenCalled();
    });

    it("ignores other notifications", () => {
      module.notificationReceived("CLOCK_MINUTE", {});
      expect(module.formattedWeatherData).toBeUndefined();
    });
  });
});

describe("time format", () => {
  const loadDefaults = (timeFormat) => {
    const saved = global.config;
    global.config = { units: "imperial", timeFormat: timeFormat };
    let defaults;
    jest.isolateModules(() => {
      require("../MMM-WeatherdotcomForecast.js");
      defaults = global.MMM_WeatherdotcomForecast.defaults;
    });
    global.config = saved;
    return defaults;
  };

  it("follows MagicMirror's global 24-hour timeFormat", () => {
    const defaults = loadDefaults(24);
    expect(defaults.label_timeFormat).toBe("HH:mm");
    expect(defaults.label_sunTimeFormat).toBe("HH:mm");
    expect(defaults.label_lastUpdateTimeFormat).toBe("HH:mm");
  });

  it("follows MagicMirror's global 12-hour timeFormat", () => {
    const defaults = loadDefaults(12);
    expect(defaults.label_timeFormat).toBe("h a");
    expect(defaults.label_sunTimeFormat).toBe("h:mm a");
    expect(defaults.label_lastUpdateTimeFormat).toBe("h:mm a");
  });
});
