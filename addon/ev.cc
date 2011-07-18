#include <node/ev/ev.h>
#include <node/v8.h>

using namespace v8;

Handle<Value> Unref(const Arguments &args) {
	HandleScope scope;
	ev_unref();
	scope.Close(Undefined());
}
Handle<Value> Ref(const Arguments &args) {
	HandleScope scope;
	ev_ref();
	scope.Close(Undefined());
}

extern "C" void init(Handle<Object> target) {
	HandleScope scope;
	target->Set(String::NewSymbol("Unref"),FunctionTemplate::New(Unref)->GetFunction());
	target->Set(String::NewSymbol("Ref"),FunctionTemplate::New(Ref)->GetFunction());
	scope.Close(target);
}
