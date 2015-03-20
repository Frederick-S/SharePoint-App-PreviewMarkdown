(function ($, marked, window) {
    function getQueryStringParameters() {
        var params = document.URL.split("?")[1].split("&");
        var obj = {};

        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            obj[singleParam[0]] = decodeURIComponent(singleParam[1]);
        }

        return obj;
    }

    function getFileServerRelativeUrl() {
        var deferred = $.Deferred();

        var queryStringParameters = getQueryStringParameters();
        var appWebUrl = queryStringParameters.SPAppWebUrl;
        var hostWebUrl = queryStringParameters.SPHostUrl;

        var clientContext = SP.ClientContext.get_current();
        var appContextSite = new SP.AppContextSite(clientContext, hostWebUrl);
        var web = appContextSite.get_web();
        var list = web.get_lists().getById(queryStringParameters.SPListId);
        var listItem = list.getItemById(queryStringParameters.SPListItemId);
        var file = listItem.get_file();

        clientContext.load(file, 'ServerRelativeUrl');
        clientContext.executeQueryAsync(function (sender, args) {
            var serverRelativeUrl = file.get_serverRelativeUrl();

            deferred.resolve(serverRelativeUrl, appWebUrl, hostWebUrl);
        }, function (sender, args) {
            var message = args.get_message();

            deferred.reject(message);
        });

        return deferred.promise();
    }

    function getFileServerRelativeUrlOnFail(message) {
        alert(message);
    }

    function readFileContents(serverRelativeUrl, appWebUrl, hostWebUrl) {
        var deferred = $.Deferred();

        var executor = new SP.RequestExecutor(appWebUrl);
        var options = {
            url: appWebUrl + "/_api/SP.AppContextSite(@target)/web/GetFileByServerRelativeUrl('" + serverRelativeUrl + "')/$value?@target='" + hostWebUrl + "'",
            type: "GET",
            success: function (response) {
                if (response.statusCode == 200) {
                    var markdown = response.body;

                    deferred.resolve(markdown);
                } else {
                    deferred.reject(response.statusCode + ": " + response.statusText);
                }
            },
            error: function (response) {
                deferred.reject(response.statusCode + ": " + response.statusText);
            }
        };

        executor.executeAsync(options);

        return deferred.promise();
    }

    function readFileContentsDeferred(serverRelativeUrl, appWebUrl, hostWebUrl) {
        readFileContents(serverRelativeUrl, appWebUrl, hostWebUrl).done(render).fail(readFileContentsOnFail);
    }

    function readFileContentsOnFail(message) {
        alert(message);
    }

    function render(markdown) {
        var html = marked(markdown);

        $('.container').html(html);
    }

    getFileServerRelativeUrl().done(readFileContentsDeferred).fail(getFileServerRelativeUrlOnFail);
})(jQuery, marked, window);