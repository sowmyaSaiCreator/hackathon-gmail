<!DOCTYPE html>
<html>

<head>
  <title>Gmail App</title>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css"
    integrity="sha512-5A8nwdMOWrSz20fDsjczgUidUBR8liPYU+WymTZP1lmY9G6Oc7HlZv156XqnsgNUzTyMefFTcsFH/tnJE/+xBg=="
    crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
    integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous" />
  <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
  <style>
    .mr10 {
      margin-right: 10px;
      width: 30px;
      display: inline-block;
    }

    * {
      box-sizing: border-box
    }

    .posRT {
      position: relative;
      top: -5px;
    }

    .font30 {
      font-size: 30px;
    }

    td:nth-child(1) {
      width: 25%;
    }

    td:nth-child(3) {
      width: 15%;
    }

    .padMar9 {
      padding: 9px;
      margin: 9px;
    }

    .mar300 {
      margin-top: 200px
    }

    .RL91 {
      position: relative;
      left: 89%;
    }

    #loader {
      position: absolute;
      top: 0px;
      right: 0px;
      width: 100%;
      height: 100%;
      background-color: #eceaea;
      background-image: url('loader.gif');
      background-size: 50px;
      background-repeat: no-repeat;
      background-position: center;
      z-index: 10000000;
      opacity: 0.4;
      filter: alpha(opacity=40);
    }

    body {
      /* background-color: #CCCCCC;*/
      position: relative;
    }

    .pointerClass tr {
      cursor: pointer;
    }

    table {
      border-left: 2px solid white;
    }

    .pad10 {
      padding: 10px;
      margin: 10px;
      width: 150px;
    }
  </style>
</head>

<body>
  <!-- onload="displayMails()" -->
  <!--Add buttons to initiate auth sequence and sign out-->
  <div class="row">
    <button id="authorize_button" class="btn btn-success col-4 text-center offset-4 mar300"
      style="display: none;">Authorize</button>
    <button id="signout_button" class="btn btn-danger RL91 col-1 padMar9 " style="display: none;">Sign
      Out</button>
  </div>


  <pre id="content" style="white-space: pre-wrap;"></pre>
  <!---   started                                 -->
  <h3 class="text-center text-danger" id="gMail">Gmail App</h3>
  <div class="container-fluid " id="container">

    <div class="row">
      <div class="col-2 pr-0 bg-dark">
        <div>
          <button class="btn btn-danger pad10" id="composeBtn" data-target="#composeModal" data-toggle="modal">
            <span class="mr10">
              <i class="fa fa-plus font30" aria-hidden="true"></i>
            </span>
            <span class="posRT">Compose</span>
          </button>
        </div>
        <div>
          <button class="btn btn-danger pad10" onclick=" displayMails();">
            <span class="mr10">
              <i class="fa fa-window-maximize font30" aria-hidden="true"></i>
            </span>
            <span class="posRT">Inbox</span>
          </button>
        </div>
        <div>
          <button class="btn btn-danger pad10" onclick="displayMails('SENT');">
            <span class="mr10"><i class="fa fa-angle-double-right font30" aria-hidden="true"></i></span>
            <span class="posRT">Sent</span>
          </button>
        </div>
        <div>
          <button class="btn btn-danger pad10" onclick="displayMails('DRAFT');">
            <span class="mr10">
              <i class="fa fa-file font30" aria-hidden="true"></i>
            </span>
            <span class="posRT">Drafts</span>
          </button>
        </div>
      </div>
      <div class="col-10 pl-0">
        <table class="table table-dark ">
          <tbody id="tbody">
            <!--display data-->
          </tbody>
        </table>
      </div>

    </div>

    <div id="loader" style="display:none;"></div>
  </div>

  <div class="modal fade" id="composeModal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">New Message</h4>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <form onsubmit="return sendMail();">
          <div class="modal-body">
            <div class="form-group">
              <input type="email" class="form-control" id="composeTo" placeholder="To" required />
            </div>

            <div class="form-group">
              <input type="text" class="form-control" id="composeSub" placeholder="Subject" required />
            </div>

            <div class="form-group">
              <textarea class="form-control" id="composeMsg" placeholder="Message" rows="10" required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="submit" id="sendBtn" class="btn btn-primary">Send</button>
            <button class="btn" type="button" onclick="closeModal()">
              <span class="mr10">
                <i class="fa fa-trash font30" aria-hidden="true"></i>
              </span>
          </div>
        </form>
      </div>
    </div>
  </div>
</body>


<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
  integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js"
  integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
<script src="base64.js"></script>
<script src="authentication.js" type="text/javascript"></script>
<script async defer src="https://apis.google.com/js/api.js" onload="this.onload=function(){};handleClientLoad()"
  onreadystatechange="if (this.readyState === 'complete') this.onload()">
  </script>


</html>
