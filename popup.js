var current_url_captcha;
var apiKey="fe190f6c7b94470ab8f4ba4b05e42d75";//anycaptcha.com
var g_recaptcha_response;

async function process(data_sitekey) { 
  //CREATE TASK
  var result1 = await fetch("https://api.anycaptcha.com/createTask", {
  method: "post",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
      clientKey: apiKey,
      task: {
        "type": "HCaptchaTaskProxyless",
        "websiteURL": current_url_captcha,
        "websiteKey": data_sitekey
      }
    })
  });

  document.write("Đang lấy taskID captcha <br>");
  var jsonResult1 = await result1.json();  
  var task_Id;
  if(jsonResult1.errorId==0){
    task_Id=jsonResult1.taskId;
    document.write("TaskID captcha:"+task_Id+"<br>");

    //GET TASK RESULT
    document.write("Gửi yêu cầu giải mã...<br>");
    var repeat=true;
    while(repeat==true){
      var result2 = await fetch("https://api.anycaptcha.com/getTaskResult", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          clientKey: apiKey,
          taskId: task_Id
        })
      });

      var jsonResult2 = await result2.json();
      //alert(jsonResult2.errorId + " " + jsonResult2.status);
      if(jsonResult2.errorId==0){
        if(jsonResult2.status=="processing"){//status=processing
          document.write("Đang xử lý...<br>");
          setTimeout(() => { repeat=true; }, 2000);

        }else if(jsonResult2.status=="ready"){
          repeat=false;
          g_recaptcha_response=jsonResult2.solution.gRecaptchaResponse;
          document.write("Mã giải: "+g_recaptcha_response);  


          try {
          chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
              current_url_captcha=tabs[0].url;
              chrome.tabs.executeScript(tabs[0].id, { code: "var textarea1=document.getElementsByName('g-recaptcha-response')[0];textarea1.style.display='block';textarea1.innerText='"+g_recaptcha_response+"';"+"var textarea2=document.getElementsByName('h-captcha-response')[0];textarea2.style.display='block';textarea2.innerText='"+g_recaptcha_response+"';"});
          });
          }
          catch (ex) {
              //alert("Lỗi: "+ex);
          }

        }
      } else {//"errorId": 1
        repeat=false;
        document.write("Lỗi:"+jsonResult2.errorCode);
      }
    }



  } else {
    document.write("Lỗi:"+jsonResult1.errorCode);
  }


}



document.getElementById('btnSolve').addEventListener('click', async () => {
    try {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            current_url_captcha=tabs[0].url;
            chrome.tabs.executeScript(tabs[0].id, { code: "document.getElementsByClassName('h-captcha')[0].getAttribute('data-sitekey');"},resultArr=>process(resultArr[0]));
        });
    }
    catch (ex) {
        alert("Lỗi: "+ex);
    }

});