const CROSS = 0
const CIRCLE = 1

class TicTac {
    constructor() {
        //all possiblities for winning the game
        // the 4th item is the name of the winnig strategy. so we can cross boxes with the line horizontly, verticaly or diagonaly
        this.winningStrategy = [
        [1,2,3, 'ht'],[4,5,6, 'hc'],[7,8,9, 'hb'],
        [1,4,7, 'vl'],[2,5,8, 'vc'],[3,6,9, 'vr'],
        [1,5,9, 'dl'],[3,5,7, 'dr']
        ]
        //All the  positions that are already occupied by another playeer
        this.occupied = []

        // current round and score of the game
        this.round = 1
        this.score = [0,0]


        // positions of the players. first arrey is the lis of positions for the player 'X' and secon one is for player'0'
        this.players = [[],[]]

        //defaul player
        this.firstPlayer = CROSS
        this.player = this.firstPlayer
        // inactive is usefu if we want to disable ticking after some player win the game  or after draw
        this.inactive = false

        //event register
        this._events = {}
    }

    //ticking. Box is an position of the box (1 - 9)
    tick(box) {
        if(!this.inactive) {
            if(typeof box !== 'number') {
                console.error('invalid type of the box')
            }
            //if we try click on the poistion higher or lower then the range (1 -9)
            else if(box > 9 || box < 1){
                console.error('Box is out of the range')
            }
            //if we tick on the position which is already ticked
            else if(this.occupied.includes(box)){
                console.error('Occupied bx')
            }
            else {
                //push box to the 'occupied and players list
                this.occupied.push(box)
                this.players[this.player].push(box)
                // figure out if this tick was them winning one
                let winner = false
                let strategy 
                this.winningStrategy.forEach(option => {
                    const result = this._has(this.players[this.player],option)
                    if(result) {
                        strategy  = option
                        winner = true
                    }
                })

                this.trigger('tick', box, this.player)
                // if there is winner then  then add score , set inactive state and trigger event
                if(winner){
                    this.score[this.player] += 1
                    this.inactive = true
                    this.trigger('win', this.player, strategy)
                }
                // if mthere is no winner but all boxes are ticked
                else if(this.occupied.length === 9) {
                    this.inactive = true
                    this.trigger('draw')
                }

                // after ticked swich to another player
                this.togglePlayer()
            }
        }
    }
    // Switch players
    togglePlayer() {
        this.player = this.player === CROSS ? CIRCLE : CROSS
    }

    //set properties for the new round
    newRound() {
        this.round += 1
        this.occupied = []
        this.players = [[],[]]
        this.firstPlayer = this.firstPlayer === CROSS ? CIRCLE : CROSS
        this.player = this.firstPlayer
        this.inactive = false

        this.trigger('new_round')
    }

    //  reset properties so we can start playin from the begining
    reset() {
        this.occupied = []
        this.round = 1
        this.score = [0,0]
        this.players = [[],[]]
        this.firstPlayer = CROSS
        this.player = this.firstPlayer
        this.inactive = false

        this.trigger('reset')
    }

    //cll callback from the event registered in the _events property
    trigger(event, ...data) {
        if(!(event in this._events))
        return false

        this._events[event].forEach(fn => {
            fn.call(this, ...data)
        })
    }
    // Register callback to the _events proprty
    on(event, fn) {
        if(event in this._events)
        this._events[event].push(fn)
        else
        this._events[event] = [fn]
    }

    // this function return true if the nnumber in the arrey 'b' are included in the arrey 'b'
    // it is use full if we wantb to figue out positions of the boxes of some player are winning positions
    _has(a,b){
        let returnValue = true
        b.forEach(key => {
            if(typeof key === 'number' && !a.includes(key))
            returnValue = false
        })

        return returnValue
    }
}

// create game intance
const game = new TicTac

//regular all HTML componenets
const componenet = {
    body:document.querySelector('body'),
    items:document.querySelectorAll('main > div'),
    score_x:document.querySelector('#score-x'),
    score_o:document.querySelector('#score-o'),
    round:document.querySelector('#round'),
    player_x:document.querySelector('#player-x'),
    player_o:document.querySelector('#player-o'),
    turn_x:document.querySelector('#turn-x'),
    turn_o:document.querySelector('#turn-o'),
    reset:document.querySelector('#reset'),
    board:document.querySelector('.board'),
    symbol:document.querySelector('.board > section .symbol'),
    title:document.querySelector('.board > section .title'),
    section:document.querySelector('.board > section')
}

// create an icon X and O
const createIcon = player => {
    const elem = document.createElement('div')
    elem.classList.add(player === 0 ? 'x' : 'o')
    return elem
}
// add active class on the player whome is playing
const toggleActive = player => {
    if(player === CROSS) {
      componenet.body.classList.add('active')
        componenet.player_x.classList.add('active')
        componenet.player_o.classList.add('change')
        componenet.player_o.classList.remove('changeo')
        componenet.turn_x.classList.add('active')
        componenet.turn_o.classList.remove('active')
        componenet.player_o.classList.remove('active')
    }
    else {
      componenet.body.classList.remove('active')
        componenet.player_x.classList.remove('active')
        componenet.turn_x.classList.remove('active')
        componenet.player_o.classList.remove('change')
        componenet.player_o.classList.add('changeo')
        componenet.turn_o.classList.add('active')
        componenet.player_o.classList.add('active')
    }
}
toggleActive(game.player)

//create new round if new round is over
componenet.section.addEventListener('click', _=> {
    game.newRound()
})

//reset game on button 
componenet.reset.addEventListener('click', _=>
    game.reset())

    //trigger ticked when box is clickd
    componenet.items.forEach((item, index) => {
        item.addEventListener('click', _=> {
            game.tick(index + 1)
        })
    })

    //default info
    componenet.round.innerText = game.round
    componenet.score_x.innerText = game.score[0]
    componenet.score_o.innerText = game.score[1]


    // if animation ended after the end of some round then section clickable so we can playe another round
    componenet.section.addEventListener('transitionend', e => {
        if(e.propertyName === 'opacity') {
            componenet.section.classList.add('clickable')
        }
    })

    game.on('tick', (box, player) => {
        //append icon to the box we clicked on

        const icon = createIcon(player)
        componenet.items[box-1].appendChild(icon)
    //box_position - 1 for valid index
    //set active class for another player
    toggleActive(game.player === CROSS ? CIRCLE : CROSS)
    })

    game.on('win', (player, strategy) => {

        //update score
    componenet.score_x.innerText = game.score[0]
    componenet.score_o.innerText = game.score[1]

    // add classes for .board when round is finished so we can start trigging animations
    componenet.board.classList.add('end')
    componenet.turn_x.classList.remove('active')
        componenet.turn_o.classList.remove('active')
    componenet.board.classList.add(strategy[3])
    if(player === CROSS)
    componenet.board.classList.add('dark')

    // handling output for the winner of the round
    componenet.symbol.classList.add(player === 0 ? 'x' : 'o')
    componenet.title.innerText = 'Winner!'
    })

    game.on('draw', player => {
        // handling output when draw
        componenet.board.classList.add('end')
        componenet.turn_x.classList.remove('active')
        componenet.turn_o.classList.remove('active')
        componenet.title.innerText = 'Draw!'
    })

    const reset = _=> {
        //reset everything to default state
        componenet.items.forEach(item => item.innerHTML = '')
        componenet.round.innerText = game.round
        componenet.score_x.innerText = game.score[0]
        componenet.score_o.innerText = game.score[1]
        componenet.board.classList.remove('end', 'dark', 'vr','vc','vl','ht','hb','hc','ht','dr','dl')
        componenet.symbol.classList.remove('x', 'o')
        componenet.title.innerText = ''
        componenet.section.classList.remove('clickable')
        toggleActive(game.player)
    }

    game.on('new_round', reset)
    game.on('reset',reset) 
    