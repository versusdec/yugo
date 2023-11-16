define(() => {
    return (cond, value, prev_ctx) => {
        switch (true) {
            case (cond.length === 1):
                if (cond[0]) {
                    return value(prev_ctx)
                }
                break;

            case (cond.length === 2):
                if (cond[0] == cond[1]) {
                    return value(prev_ctx)
                }
                break;

            case (cond.length === 3):
                try {
                    if(cond[1] === 'IN'){
                        let arr = Array.from(cond).slice(2)
                        if(arr.includes(cond[0])){
                            return value(prev_ctx)
                        }
                    } else {
                        if (typeof cond[0] == "string") {
                            cond[0] = '"' + cond[0] + '"';
                        }

                        if (typeof cond[2] == "string") {
                            cond[2] = '"' + cond[2] + '"';
                        }
                        if (eval(cond[0] + cond[1] + cond[2])) {
                            return value(prev_ctx)
                        }
                    }


                } catch (e) {
                    console.log(cond);
                    console.error(e);
                }
                break;
            case (cond.length > 3):
                if(cond[1] === 'IN'){
                    let arr = Array.from(cond).slice(2)
                    if(arr.includes(cond[0])){
                        return value(prev_ctx)
                    }
                }
                break;
        }
    }
})