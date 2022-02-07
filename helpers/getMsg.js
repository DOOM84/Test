import getRandom from "~/helpers/getRandom";

const messages = [
    {
        count: [3,23],
        success: [
            'On the right track.',
            'Yes, sure',
            'You are right.',
            'Not bad',
        ],
    },
    {
        count: [4,24],
        success: [
            'What a good chance!',
            'Exactly so.',
        ]

    },
    {
        count: [5,25],
        success: [
            'This way',
            'Right you are',
            'That\'s true.',
            'That\'s it.',
            'That\'s cold.',
            'You have a case.',
            'Cinch',
            'Cert',
            'Sure thing',
            'Cool',
            'I\'m very glad',
            'On the nose',
            'It is in the bag',
            'What a good chance!',
            'Most likely.',
        ],
        fail: [
            'Don\'t get upset.',
            'Next time lucky.',
            'Calm down.',
            'Take it easy.',
            'Don\'t get mad!',
            'Cool it.',
            'Pull yourself together!',
            'Let us hope for the best.',
            'Everything will be all right.',
            'Things happen.',
            'What a pity!',
            'It leaves much to be desired.',
        ]
    },
    {
        count: [7, 27],
        success: [
            'That\'s right.',
        ]

    },
    {
        count: [10, 30],
        success: [
            'Very nice',
            'I can\'t believe it!',
            'It is as good as done.',
            'You make me mad.',
            'Very well.',
        ]

    },
    {
        count: [18, 38],
        success: [
            'That\'s the way to do it',
        ],
        fail: [
            'Don’t take it to heart.',
            'Don’t get upset about it.',
            'Next time lucky.',
            'I appreciate your difficulties.',
            'What\'s done is done.',
        ]
    },

    {
        count: [20, 40],
        success: [
            'That\'s the way to do it',
        ],
    },
    {
        count: [49],
        success: [
            'Well done!',
            'Very well',
        ],
    },
];

export default (final, answLength) => {

    const actualMsgs = messages
        .filter((msg)=> msg.count.includes(answLength))[0]

    let phrase = null;


    if(final >= 90){
        phrase = {
            type: 'success',
            msg: actualMsgs.success[getRandom(actualMsgs.success.length - 1, 0)]
        }
    }

    if(final < 34){
        if(actualMsgs.fail){
            phrase = {
                type: 'warning',
                msg: actualMsgs.fail[getRandom(actualMsgs.fail.length - 1, 0)]
            }
        }
    }

    return phrase
}


