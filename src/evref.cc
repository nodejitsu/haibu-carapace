#include <node.h>
#ifdef UV_VERSION_MAJOR
        #include <uv.h>
#else
	#include <ev.h>
#endif
#include <v8.h>

using namespace v8;

Handle<Value> Unref(const Arguments &args) {
	HandleScope scope;
#ifdef UV_VERSION_MAJOR
        uv_unref(uv_default_loop()); 
#else
        ev_unref();
#endif
	scope.Close(Undefined());
}
Handle<Value> Ref(const Arguments &args) {
	HandleScope scope;
#ifdef UV_VERSION_MAJOR
        uv_ref(uv_default_loop()); 
#else
        ev_ref();
#endif
	scope.Close(Undefined());
}

extern "C" void init(Handle<Object> target) {
	HandleScope scope;
	target->Set(String::NewSymbol("unref"),FunctionTemplate::New(Unref)->GetFunction());
	target->Set(String::NewSymbol("ref"),FunctionTemplate::New(Ref)->GetFunction());
	scope.Close(target);
}
