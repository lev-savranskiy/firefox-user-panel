function classifyFile(prefix,  proc, ip, port) {

        var inputStream;


        //https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsISocketTransport
        //https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsITransport

        var transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService);
        var transport = transportService.createTransport(null, 0, ip, port, null);

        //TIMEOUT_CONNECT
        transport.setTimeout(0, 10);
        //TIMEOUT_READ_WRITE
        transport.setTimeout(1, 10);

        var instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);


        /*
         nsIOutputStream openOutputStream(
         in unsigned long aFlags,
         //pass 0 to use default value
         in unsigned long aSegmentSize,
         in unsigned long aSegmentCount
         );
         */

        var outstream = transport.openOutputStream(1 | 2, 0, 0);
        var stream;
        instream.init(stream = transport.openInputStream(0, 0, 0));

        var dataListener = {
            t_stream: null,
            t_instream: null,
            t_transport: null,
            proc: null,
            data: "",
            onStartRequest: function (request, context) {
            },
            onStopRequest: function (request, context, status) {

                debug("[onStopRequest] \t context " + context  + " \t status " + status);

                    if (this.data.length == 0) {
                        alert("Check Service IP and port and VPN/connection settings!");
                    } else {

                         //handle (this.data);
                    }

            },
            onDataAvailable: function (request, context, inputStream, offset, count) {
                debug('[onDataAvailable]');
                debug('context');
                debug(context);
                debug('inputStream');
                debug(inputStream);
                debug('count');
                debug(count);
//                if (newAPI){
//                    this.data += NetUtil.readInputStreamToString(stream, count);
//                }else{
                this.data += this.t_instream.read(count);
//                }

            }
        };
        dataListener.proc = proc;
        dataListener.t_stream = stream;
        dataListener.t_instream = instream;
        dataListener.t_transport = transport;

        var thread = {
            t_outstream: null,
            t_prefix: null,

            t_file: null,
            t_inputStream: null,

            t_fileSize: null,
            run: function() {
                try {

                    debug('run() ok')
                    var len = this.t_prefix.length + this.t_fileSize;
                    var strlen1 = len + " ";
                    if (proto_flag == null)
                        this.t_outstream.write(strlen1, strlen1.length);
                    this.t_outstream.write(this.t_prefix, this.t_prefix.length);
                    this.t_outstream.flush();
                    this.t_outstream.close();
                } catch (excc) {

                    this.proc.error("run() Exception: " + excc.message);
                    if (excc.stack) {
                        alert(excc.stack);
                    }


                }
            }
        };
        if (proc != null) {
            proc.start();
        }


        thread.t_outstream = outstream;
        thread.t_prefix = prefix;
        thread.t_inputStream = inputStream;
        thread.t_remove = remove;


            var threadManager = Components.classes["@mozilla.org/thread-manager;1"]
                .getService(Components.interfaces.nsIThreadManager)
                .newThread(0);
            threadManager.dispatch(thread, threadManager.DISPATCH_NORMAL);




        var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
        pump.init(stream, -1, -1, 0, 0, true);
        pump.asyncRead(dataListener, null);

}


var prefix = "CFsendCookieFeed\t" + top.window.getBrowser().currentURI.spec + "\t";
var proc = {
    start: function start() {

        // disable some stuff
    },
    end: function end(result) {

        // enable stuff and parse  result


    },
    error: function error(str) {
        // show error
    }
};
classifyFile(prefix, null, false, proc, '10.10.10.10', 8457);


