

export class GameEvent{
    constructor(text,log,choices,exits,trigger_distance = 1,slowmo=false,stop = false,ratio=1){
        /* text: String */
        /* choices: [String,String,etc.] */
        /* exits: [int,int,etc] */

        this.text = text;
        this.log = log;
        this.choices = choices;
        this.exits = exits;
        this.trigger_distance = trigger_distance;
        this.slowmo = slowmo;
        this.triggered = false;
        this.active = false;
        this.answered = false;
        this.stop = stop;
        this.ratio = ratio;
    }
}