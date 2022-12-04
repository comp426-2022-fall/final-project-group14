export default function bonus(data){
    var strength = 0
    var dexterity = 0
    var constitution = 0
    var intelligence = 0
    var wisdom = 0
    var charisma = 0

    var ability = []

    const ability_bonuses = data.ability_bonuses;

    for (var i=0; i<ability_bonuses.length; i++) {
        // add ability bonuses to each character
        var ability_num = ability_bonuses[i];
        var ability_index = ability_num.ability_score.index;
        var bonus = parseInt(ability_num.bonus)
        switch (ability_index){
            case "str":
                strength = strength + bonus
                break
            case "dex":
                dexterity = dexterity + bonus
                break
            case "con":
                constitution = constitution + bonus
                break
            case "int":
                intelligence = intelligence + bonus
                break
            case "wis":
                wisdom = wisdom + bonus
                break
            case "cha":
                charisma = charisma + bonus
                break
            default:
                console.log("ability bonus not found: " + ability_index)          
        }
    }

    ability.push(strength)
    ability.push(dexterity)
    ability.push(constitution)
    ability.push(intelligence)
    ability.push(wisdom)
    ability.push(charisma)
    
    return ability
}