define(
    ["microcore", "mst!/networks/list"],
    function (mc, view
    ) {
        return function (params) {
            document.title = "Сети | Yugo Platform";
            let title = 'Сети'

            return view({
                title: title
            });
        }
    });