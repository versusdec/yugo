define(
    ["microcore", "mst!/sources/list"],
    function (mc, view
) {
    return function (params) {
        document.title = "Источники | Yugo Platform";
        let title = 'Источники'

        return view({
            title: title
        });
    }
});