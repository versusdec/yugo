define(
    ["microcore", "mst!/tags/list"],
    function (mc, view
    ) {
        return function (params) {
            document.title = "Тэги | Yugo Platform";
            let title = 'Тэги';

            return view({
                title: title
            });
        }
    });