
function roll(sides, dice, rolls) {
    const results = [];
    
    for (let i = 0; i < rolls; i++) {
        var num = 0;
        for (let j = 0; j < dice; j++) {
            num = num + 1 + Math.floor(Math.random() * sides)
        }
        results[i] = num
    }
    
    let final = {
        "sides": sides,
        "dice": dice,
        "rolls": rolls,
        "results": results
    }
    return final
}

module.exports = roll