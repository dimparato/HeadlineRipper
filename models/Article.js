var mongoose=require("mongoose");
require("mongoose-type-url");

var Schema=mongoose.Schema;

var ArticleSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    link:{
        type: mongoose.SchemaTypes.Url,
        required:true
    },
    note:{
        type:Schema.Types.ObjectId,
        ref:"Note"
    }
});

var Article=mongoose.model("Article", ArticleSchema);

module.exports=Article;