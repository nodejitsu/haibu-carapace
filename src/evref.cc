#include <uv.h>
#include <v8.h>

using namespace v8;

Handle<Value> Unref(const Arguments &args) {
	HandleScope scope;
	uv_unref(uv_default_loop());
	scope.Close(Undefined());
}
Handle<Value> Ref(const Arguments &args) {
	HandleScope scope;
	uv_ref(uv_default_loop());
	scope.Close(Undefined());
}

extern "C" void init(Handle<Object> target) {
	HandleScope scope;
	target->Set(String::NewSymbol("unref"),FunctionTemplate::New(Unref)->GetFunction());
	target->Set(String::NewSymbol("ref"),FunctionTemplate::New(Ref)->GetFunction());
	scope.Close(target);
}
