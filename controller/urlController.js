import { database } from "../db/db.js";
import shortid from "shortid";
// import redisClient from "../utilis/redies.js";

export const urlGenerate = async (req, res) => {
  try {
    const { longUrl, topic } = req.body;

    const customAlias = shortid(8);
    const [response] = await database.query(
      `INSERT INTO url (longUrl, customAlias, topic) VALUES (?, ?, ?)`,
      [longUrl, customAlias, topic]
    );

    const [data] = await database.query(
      `SELECT customAlias AS shortUrl , createdAt FROM url WHERE id = LAST_INSERT_ID()`
    );

    if (data.length > 0) {
      res.status(200).json({
        status: "success",
        data,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.response,
      status: "error",
    });
    console.log(error);
  }
};




export const redirectUrl = async (req, res) => {
  try {
    const { alias } = req.params;

    // const cachedUrl = await redisClient.get(`shortUrl:${alias}`);
    // if (cachedUrl) {
    //   console.log("Cache hit");
    //   res.redirect(cachedUrl);
    //   return;
    // }

    const [response] = await database.query(
      `SELECT longUrl FROM url WHERE customAlias = ?`,
      [alias]
    );

    if (response.length > 0) {

        // await redisClient.set(`shortUrl:${alias}`, urlRecord[0].longUrl, { EX: 3600 });
      const longUrl = response[0].longUrl;


      const ipAddress = req.ip || req.connection.remoteAddress;

     
      const userAgent = req.headers['user-agent'];
      const osTypeMatch = userAgent.match(/\((.*?)\)/);
      const osType = osTypeMatch ? osTypeMatch[1] : 'Unknown OS';
      const deviceType = /mobile/i.test(userAgent) ? 'Mobile' : 'Desktop';

     
      await database.query(
        `INSERT INTO url_analytics (customAlias, ipAddress, osType, deviceType, clickDate) VALUES (?, ?, ?, ?, NOW())`,
        [alias, ipAddress, osType, deviceType]
      );

   
      res.redirect(longUrl);
    } else {
      res.status(404).json({
        status: "error",
        message: "Alias not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred.",
    });
    console.error(error);
  }
};


export const getAnayltics = async (req, res) => {
    try {
      const { alias } = req.params;
      // const cachedAnalytics = await redisClient.get(`analytics:${alias}`);
      // if (cachedAnalytics) {
      //   console.log("Cache hit");
      //   res.status(200).json({ status: "success", response: JSON.parse(cachedAnalytics) });
      //   return;
      // }
      const [totalClicks] = await database.query(
        `SELECT COUNT(*) AS totalClicks FROM url_analytics WHERE customAlias = ?`,
        [alias]
      );
  
      const [uniqueClicks] = await database.query(
        `SELECT COUNT(DISTINCT ipAddress) AS uniqueClicks FROM url_analytics WHERE customAlias = ?`,
        [alias]
      );
  
      const [clicksByDate] = await database.query(
        `SELECT DATE(clickDate) AS date, COUNT(*) AS clickCount 
         FROM url_analytics 
         WHERE customAlias = ? 
         AND clickDate >= NOW() - INTERVAL 7 DAY 
         GROUP BY date 
         ORDER BY date DESC`,
        [alias]
      );
  
      const [osType] = await database.query(
        `SELECT osType, COUNT(DISTINCT ipAddress) AS uniqueClicks 
         FROM url_analytics 
         WHERE customAlias = ? 
         GROUP BY osType`,
        [alias]
      );
  
      const [deviceType] = await database.query(
        `SELECT deviceType, COUNT(DISTINCT ipAddress) AS uniqueClicks 
         FROM url_analytics 
         WHERE customAlias = ? 
         GROUP BY deviceType`,
        [alias]
      );
  
      const response = {
        totalClicks: totalClicks[0]?.totalClicks || 0,
        uniqueClicks: uniqueClicks[0]?.uniqueClicks || 0,
        clicksByDate: clicksByDate || [],
        osType: osType || [],
        deviceType: deviceType || []
      };
      await redisClient.set(`analytics:${alias}`, JSON.stringify(response), { EX: 3600 });
      res.status(200).json({
        status: "success",
        response
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        message: error.message || "An unexpected error occurred."
      });
    }
  };
  

  export const getTopicAnalytics = async (req, res) => {
    try {
      const { topic } = req.params;
  
     
      const [totalClicks] = await database.query(
        `SELECT COUNT(*) AS totalClicks FROM url_analytics 
         WHERE customAlias IN (SELECT customAlias FROM url WHERE topic = ?)`,
        [topic]
      );
  
     
      const [uniqueClicks] = await database.query(
        `SELECT COUNT(DISTINCT ipAddress) AS uniqueClicks FROM url_analytics 
         WHERE customAlias IN (SELECT customAlias FROM url WHERE topic = ?)`,
        [topic]
      );
  
    
      const [clicksByDate] = await database.query(
        `SELECT DATE(clickDate) AS date, COUNT(*) AS clickCount 
         FROM url_analytics 
         WHERE customAlias IN (SELECT customAlias FROM url WHERE topic = ?) 
         AND clickDate >= NOW() - INTERVAL 7 DAY 
         GROUP BY date 
         ORDER BY date DESC`,
        [topic]
      );
  
    
      const [urls] = await database.query(
        `SELECT customAlias AS shortUrl, 
                (SELECT COUNT(*) FROM url_analytics WHERE customAlias = u.customAlias) AS totalClicks, 
                (SELECT COUNT(DISTINCT ipAddress) FROM url_analytics WHERE customAlias = u.customAlias) AS uniqueClicks
         FROM url u 
         WHERE topic = ?`,
        [topic]
      );
  
      const response = {
        totalClicks: totalClicks[0]?.totalClicks || 0,
        uniqueClicks: uniqueClicks[0]?.uniqueClicks || 0,
        clicksByDate: clicksByDate || [],
        urls: urls || []
      };
  
      res.status(200).json({
        status: "success",
        response
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "error",
        message: error.message || "An unexpected error occurred."
      });
    }
  };


export const getOverallAnalytics = async (req, res) => {
  try {
    const [totalUrls] = await database.query(`SELECT COUNT(*) AS totalUrls FROM url`);
    const [totalClicks] = await database.query(`SELECT COUNT(*) AS totalClicks FROM url_analytics`);
    const [uniqueClicks] = await database.query(`SELECT COUNT(DISTINCT ipAddress) AS uniqueClicks FROM url_analytics`);

    const [clicksByDate] = await database.query(
      `SELECT DATE(clickDate) AS date, COUNT(*) AS clickCount 
       FROM url_analytics 
       WHERE clickDate >= NOW() - INTERVAL 7 DAY 
       GROUP BY date 
       ORDER BY date DESC`
    );

    const [osType] = await database.query(
      `SELECT osType, COUNT(DISTINCT ipAddress) AS uniqueClicks FROM url_analytics GROUP BY osType`
    );

    const [deviceType] = await database.query(
      `SELECT deviceType, COUNT(DISTINCT ipAddress) AS uniqueClicks FROM url_analytics GROUP BY deviceType`
    );

    const response = {
      totalUrls: totalUrls[0]?.totalUrls || 0,
      totalClicks: totalClicks[0]?.totalClicks || 0,
      uniqueClicks: uniqueClicks[0]?.uniqueClicks || 0,
      clicksByDate: clicksByDate || [],
      osType: osType || [],
      deviceType: deviceType || []
    };

    res.status(200).json({
      status: "success",
      response
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: "error",
      message: error.message || "An unexpected error occurred."
    });
  }
};

  
  
  
  