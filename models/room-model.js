const mongoose        = require('mongoose');
const Schema          = mongoose.Schema;
const roomSchema      = new Schema({
    name:               {type: String, required: true },
    picture:            {type: String, required: false },
    desc:               {type: String, required: false },
    owner:              {type: Schema.Types.ObjectId, ref: 'User' },  //references this as a MongoDB type User type

});
const Room            = mongoose.model('Room', roomSchema);
module.exports        = Room;
