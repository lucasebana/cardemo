

export class GameEvent{
    constructor(text,choices,exits,trigger_distance = 1,slowmo=false){
        /* text: String */
        /* choices: [String,String,etc.] */
        /* exits: [int,int,etc] */

        this.text = text;
        this.choices = choices;
        this.exits = exits;
        this.trigger_distance = trigger_distance;
        this.slowmo = slowmo;
        this.triggered = false;
        this.active = false;
    }
}