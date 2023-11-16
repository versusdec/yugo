define(
    ["microcore", "mst!/acl/list"],
    function (mc, view
    ) {
        return function (params) {
            document.title = "ACL | Yugo Platform";
            let title = 'Шаблоны ACL'

            return view({
                title: title
            });
        }
    });