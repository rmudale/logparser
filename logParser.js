/* 
 * Log Parser 
 * Authour Raj
 */
function Parser() {
    this.bind();
    this.logs = [];
   
    /* Regx */
    this.regxIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    this.regxTimestamp = /[0-9]{2}\/[A-Z]{1}[a-z]{2}\/[0-9]{4}:[0-9]{2}:[0-9]{2}:[0-9]{2}/g;
    this.regxReqUrl = /(GET|POST|PUT|DELETE|HEAD)\s\/(.*)\s(HTTP\/[1|2]\.[0|1])/gi ///(GET|POST|PUT|DELETE)\s(.*)\.(.*)\s(HTTP\/2\.0)/gi;
    this.regxRefUrl =  /"http(s)?\:\/\/(.*?)"/gi;
    this.regxOs = /Mozilla\/([0-9.]+)\s(.*)/gi;
}

Parser.prototype = {
    constructor: Parser,

    readLog : function(e) {

    	//Retrieve the first (and only!) File from the FileList object
    	var f = e.target.files[0];      
      document.getElementById("upload_file").value = f.name;

	    if (f) {
	      	var r = new FileReader();
	      	// r.onerror = this.errorHandler;
    		  // r.onprogress = this.updateProgress;

  	    	// r.onloadstart = function(e) {
  	    	// }

	      	r.onload = function(e) {
		  		  lines = e.target.result.split(/\r?\n/);;
            lines.forEach(function (line) {
              self.processLogs(line);
            }); 
            sessionStorage.removeItem('logs');
            sessionStorage.setItem('logs', JSON.stringify(self.logs));
	      	}
	      	r.readAsText(f);
	    } else { 
	      alert("Failed to load file");
	    }
    },

    processLogs : function (line) {
      var ip = line.match(this.regxIP)[0];
      var timestamp = line.match(this.regxTimestamp)[0];
      var reqUrl = (line.match(this.regxReqUrl)) ? line.match(this.regxReqUrl)[0] : '';
      var referrerUrl = (line.match(this.regxRefUrl)) ? line.match(this.regxRefUrl)[0].replace(/"/g, "") : '';
      var os = (line.match(this.regxOs)) ? line.match(this.regxOs)[0] : '';
      var item = {  'ip' : ip, 
                    'timestamp' : timestamp,
                    'log_details' : line,
                    'requestUrl' : reqUrl, 
                    'referrerUrl' : referrerUrl,
                    'os' : os}
      self.logs.push(item);
    },

  	parseLog : function() {
      if(self.logs.length == 0) {
        self.logs = JSON.parse(sessionStorage.getItem('logs'));
      }

      document.getElementById('list').innerHTML = '';
      var matches = [];
      var ipPattern;

  		var inptIP = document.getElementById('inptIP').value.trim();
      var inptOS = document.getElementById('inptOS').value.trim();

      if(inptOS != '' && inptIP != '' && self.validateIPaddress(inptIP)) {
        self.logs.forEach( function (logItem)
        {
            if(logItem.ip === inptIP && logItem.os.indexOf(inptOS) != -1 ) {
              matches.push(logItem);
            }
        });
        self.displayParse(matches);
      
      } else if(inptIP != '' && self.validateIPaddress(inptIP)) {
      
        self.logs.forEach( function (logItem)
        {
            if(logItem.ip === inptIP) {
              matches.push(logItem);
            }
        });
        self.displayParse(matches);
      } else if(inptOS != '') {
        self.logs.forEach( function (logItem)
        {
            if(logItem.os.indexOf(inptOS) != -1 ) {
              matches.push(logItem);
            }
        });
        self.displayParse(matches);
      }

  	},

    displayParse : function(matches) {
      document.getElementById('list').innerHTML = '';
      document.getElementById('res_title').innerHTML = '';

      if(matches.length > 0) {
        document.getElementById('res_title').innerHTML="<span>"+matches.length+" Matching Entries Found. </span>"
        matches.forEach(function(item) {
          var e = document.createElement('li');
          var html = "<div title='"+item.log_details+"'>"
                     +"<span class='block'> <b>IP Address :</b>"+item.ip+"</span>"
                     +"<span class='block'> <b> Request Url :</b>"+item.requestUrl+"</span>,"
                     +"<span class='block'> <b> Referer Url :</b>"+item.referrerUrl+"</span>,"
                     +"<span class='block'> <b> Device OS :</b>"+item.os+"</span>,"
                     +"<span class='block'> <b>Date & Time :</b>"+item.timestamp+"</span>";
              e.innerHTML = html;
              document.getElementById('list').appendChild(e);
        });
      } else {
         document.getElementById('res_title').innerHTML="<span>No Matching Logs Found</span>"
      }
    },

    validateIPaddress : function (ipaddress)   
    {  
     if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))  
      {  
        return (true)  
      }  
      alert("You have entered an invalid IP address!")  
      return (false)  
    },
    
    bind: function () {
        self = this;   
        document.getElementById('files').addEventListener('change', this.readLog, false);
        document.getElementById('submit').addEventListener('click', this.parseLog, false);
    }
};

var parser = new Parser();