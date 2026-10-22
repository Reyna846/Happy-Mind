import assert from 'node:assert/strict';
import {needsStructuredReply,conversationInstructions} from '../src/conversation-policy.ts';
for(const words of ['Hello','I am worried about work','What should I say to my friend?','I do not want advice','My garden died','I want to talk about my day'])assert.equal(needsStructuredReply(words),false,words);
for(const words of ['Can we try a breathing exercise?','Create a garden','Show me a constellation','Suggest an activity'])assert.equal(needsStructuredReply(words),true,words);
assert.match(conversationInstructions,/answer it directly/);assert.match(conversationInstructions,/earlier turns/);assert.match(conversationInstructions,/no advice/);
console.log('Conversation policy passed: ordinary dialogue avoids structured decoding, explicit creations keep validation, direct answers and context instructed.');
