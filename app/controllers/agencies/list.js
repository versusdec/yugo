define(
    ["microcore", "mst!/agencies/list"],
    function (mc, view
    ) {
        return function (params) {
            document.title = "Агентства | Yugo Platform";
            let title = 'Агентства'

            return view({
                title: title
            });
        }
    });