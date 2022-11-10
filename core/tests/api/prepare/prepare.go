package prepare

import (
	instapi "github/labring/laf/core/controllers/instance/tests/api"

	appapi "github.com/labring/laf/core/controllers/application/tests/api"
	dbapi "github.com/labring/laf/core/controllers/database/tests/api"
	ossapi "github.com/labring/laf/core/controllers/oss/tests/api"
	runtimeapi "github.com/labring/laf/core/controllers/runtime/tests/api"
)

// PrepareAllSuites prepares all suites
func PrepareAllSuites(namespace string, region string, name string) {
	PrepareDatabaseSuite(namespace, region, name)
	PrepareOssSuite(namespace, region, name)
	PrepareAppSuite(namespace, region, name)
}

// CleanupAllSuites clean up all suites
func CleanupAllSuites(namespace string, name string) {
	CleanupDatabaseSuite(namespace, name)
	CleanupOssSuite(namespace, name)
	CleanupAppSuite(namespace, name)
}

// PrepareDatabaseSuite prepares the database suite
func PrepareDatabaseSuite(namespace string, region string, name string) {
	// install mongodb
	dbapi.InstallMongoDb(namespace)

	// create db store
	dbapi.CreateDatabaseStore(namespace, name, region, dbapi.GetMongoDbConnectionUri())
}

// CleanupDatabaseSuite clean up the database suite
func CleanupDatabaseSuite(namespace string, name string) {
	// delete db store
	dbapi.DeleteDatabaseStore(namespace, name)

	// uninstall mongodb
	dbapi.UninstallMongoDb(namespace)
}

// PrepareOssSuite prepares the oss suite
func PrepareOssSuite(namespace string, region string, name string) {
	// install minio
	ossapi.InstallMinio(namespace, region)

	// create oss store
	ossapi.CreateOssStore(namespace, name, region, ossapi.GetMinioHostname())
}

// CleanupOssSuite clean up the oss suite
func CleanupOssSuite(namespace string, name string) {
	// delete oss store
	ossapi.DeleteOssStore(namespace, name)

	// uninstall minio
	ossapi.UninstallMinio(namespace)
}

func PrepareAppSuite(namespace string, region string, name string) {
	// create instance cluster
	err := instapi.CreateCluster(namespace, name, region)
	if err != nil {
		panic(err)
	}

	// create runtime
	runtimeapi.CreateAppRuntime(namespace, name)

	// create bundle
	appapi.CreateAppBundle(namespace, name)
}

// CleanupAppSuite clean up the app suite
func CleanupAppSuite(namespace string, name string) {
	// delete bundle
	appapi.DeleteAppBundle(namespace, name)

	// delete runtime
	runtimeapi.DeleteAppRuntime(namespace, name)

	// delete instance cluster
	instapi.DeleteCluster(namespace, name)
}
