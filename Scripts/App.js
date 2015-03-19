(function ($, window) {
    function getQueryStringParameters() {
        var params = document.URL.split("?")[1].split("&");
        var obj = {};

        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            obj[singleParam[0]] = decodeURIComponent(singleParam[1]);
        }

        return obj;
    }

    function getFile() {
        var urlTokens = getQueryStringParameters();
        var appWebUrl = urlTokens.SPAppWebUrl;
        var hostWebUrl = urlTokens.SPHostUrl;

        var clientContext = SP.ClientContext.get_current();
        var appContextSite = new SP.AppContextSite(clientContext, hostWebUrl);
        var web = appContextSite.get_web();
        var list = web.get_lists().getById(urlTokens.SPListId);
        var listItem = list.getItemById(urlTokens.SPListItemId);
        var file = listItem.get_file();

        clientContext.load(file, 'ServerRelativeUrl');
        clientContext.executeQueryAsync(function (sender, args) {
            var serverRelativeUrl = file.get_serverRelativeUrl();
            var executor = new SP.RequestExecutor(appWebUrl);
            var options = {
                url: appWebUrl + "/_api/SP.AppContextSite(@target)/web/GetFileByServerRelativeUrl('" + serverRelativeUrl + "')/$value?@target='" + hostWebUrl + "'",
                type: "GET",
                success: function (response) {
                    if (response.statusCode == 200) {
                        alert(response.body);
                    } else {
                        alert(response.statusCode + ": " + response.statusText)
                    }
                },
                error: function (response) {
                    alert(response.statusCode + ": " + response.statusText)
                }
            };
            executor.executeAsync(options);
        }, function (sender, args) {
            var message = args.get_message();
        });
    }

    getFile();
})(jQuery, window);